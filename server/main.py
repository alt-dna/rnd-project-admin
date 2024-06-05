import threading
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from detection_model import process_frames
from model import cameras_collection
from bson import ObjectId
import cv2
import os
from threading import Thread, Lock
from concurrent.futures import ThreadPoolExecutor
import logging
import time
import asyncio
import urllib.parse
from collections import defaultdict, deque

app = Flask(__name__)
CORS(app)

detection_states = {}
state_lock = Lock()
pcs = set()
script_dir = os.path.dirname(os.path.realpath(__file__))
executor = ThreadPoolExecutor(max_workers=8)

logging.basicConfig(level=logging.INFO)

frame_queues = defaultdict(lambda: deque(maxlen=10))


def video_streaming(video_source, camera_id, location):
    thread_id = threading.get_ident()
    logging.info(f"Start video stream {camera_id} on {thread_id}")
    cap = cv2.VideoCapture(video_source)
    if not cap.isOpened():
        logging.error(f"Failed to open source for camera {camera_id} on {thread_id}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    desired_fps = 10

    if fps <= 0:
        logging.warning(f"Invalid FPS ({fps}) for camera {camera_id} on {thread_id}")
        fps = 30

    frame_interval = int(fps / desired_fps)
    if frame_interval <= 0:
        frame_interval = 1

    frame_count = 0
    batch_size = 8
    frames = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            logging.error(f"Failed to read frame from camera {camera_id} on {thread_id}")
            break

        if frame_count % frame_interval == 0:
            frames.append(frame)
            if len(frames) == batch_size:
                logging.info(f"Processing batch of frames for camera {camera_id} on {thread_id}")
                future = executor.submit(process_frames, frames, camera_id, location)
                processed_frames = future.result()
                for processed_frame in processed_frames:
                    ret, buffer = cv2.imencode('.jpg', processed_frame)
                    if ret:
                        frame_bytes = buffer.tobytes()
                        frame_queues[camera_id].append(frame_bytes)
                        logging.info(f"Frame appended to queue for camera {camera_id} on {thread_id}")
                frames = []
        frame_count += 1

    if frames:
        logging.info(f"Processing remaining frames for camera {camera_id} on {thread_id}")
        future = executor.submit(process_frames, frames, camera_id, location)
        processed_frames = future.result()
        for processed_frame in processed_frames:
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if ret:
                frame_bytes = buffer.tobytes()
                frame_queues[camera_id].append(frame_bytes)
                logging.info(f"Frame appended to queue for camera {camera_id} on {thread_id}")

    cap.release()
    logging.info(f"Video capture released for camera {camera_id} on {thread_id}")


@app.route('/processed_video_feed')
def processed_video_feed():
    camera_id = request.args.get('camera_id')
    camera_url = request.args.get('camera_url')
    location = "unknown"

    if not camera_id and not camera_url:
        return jsonify({"error": "Camera ID or URL not provided"}), 400

    if camera_id:
        logging.info(f"Received camera_id: {camera_id}")
        try:
            obj_id = ObjectId(camera_id)
            query = {"_id": obj_id}
            camera = cameras_collection.find_one(query)
        except Exception as e:
            logging.error(f"Error accessing database: {e}")
            return jsonify({"error": "Error accessing database"}), 500

        if not camera:
            return jsonify({"error": "Camera not found"}), 404

        camera_url = camera.get('cameraUrl')
        location = camera.get('cameraFullAddress', 'unknown')
        if not camera_url:
            return jsonify({"error": "Camera URL not found"}), 404

    if camera_url:
        camera_url = urllib.parse.unquote(camera_url)
        logging.info(f"Using camera URL: {camera_url}")

    if camera_id and camera_id not in frame_queues:
        logging.info(f"Starting video streaming for camera {camera_id}")
        thread = Thread(target=video_streaming, args=(camera_url, camera_id, location))
        thread.daemon = True
        thread.start()

    def generate():
        while True:
            with state_lock:
                if frame_queues[camera_id]:
                    frame_bytes = frame_queues[camera_id].popleft()
                    logging.info(f"Yielding frame for camera {camera_id}")
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                else:
                    logging.info(f"Frame queue is empty for camera {camera_id}")
                    time.sleep(0.1)

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route("/start_processing", methods=["POST"])
def start_processing():
    video_sources = []
    cameras = cameras_collection.find()
    for camera in cameras:
        video_source = camera['cameraUrl']
        camera_id = str(camera['_id'])
        video_sources.append((video_source, camera_id, camera.get('cameraFullAddress', 'unknown')))

    for video_source, camera_id, location in video_sources:
        thread = Thread(target=video_streaming, args=(video_source, camera_id, location))
        thread.daemon = True
        thread.start()

    return jsonify({"status": "Processing started for all cameras"})


@app.route("/shutdown", methods=["POST"])
async def shutdown():
    tasks = [pc.close() for pc in pcs]
    await asyncio.gather(*tasks)
    pcs.clear()
    return jsonify({"result": "shutdown"})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
