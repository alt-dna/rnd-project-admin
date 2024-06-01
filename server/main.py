from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from detection_model import process_frames
from model import insert_accident, find_accidents, cameras_collection, accidents_collection
from notification import subscribe, notify_new_accident
from bson import ObjectId
import cv2
import os
from threading import Thread, Lock
from concurrent.futures import ThreadPoolExecutor
import logging
import asyncio
import urllib.parse

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

global video_sources
detection_states = {}
state_lock = Lock()
pcs = set()
script_dir = os.path.dirname(os.path.realpath(__file__))
executor = ThreadPoolExecutor(max_workers=8)

logging.basicConfig(level=logging.INFO)


def video_streaming(video_source, camera_id, location):
    cap = cv2.VideoCapture(video_source)
    fps = cap.get(cv2.CAP_PROP_FPS)
    desired_fps = 10
    frame_interval = int(fps / desired_fps)
    frame_count = 0
    batch_size = 4
    frames = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if frame_count % frame_interval == 0:
            frames.append(frame)
            if len(frames) == batch_size:
                future = executor.submit(process_frames, frames, camera_id, location)
                processed_frames = future.result()
                for processed_frame in processed_frames:
                    ret, buffer = cv2.imencode('.jpg', processed_frame)
                    if ret:
                        frame_bytes = buffer.tobytes()
                        yield (b'--frame\r\n'
                               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                frames = []
        frame_count += 1

    if frames:
        future = executor.submit(process_frames, frames, camera_id, location)
        processed_frames = future.result()
        for processed_frame in processed_frames:
            ret, buffer = cv2.imencode('.jpg', processed_frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()


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

    return Response(video_streaming(camera_url, camera_id, location),
                    mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/detection_results', methods=['GET'])
def detection_results():
    camera_id = request.args.get('camera_id')
    if camera_id in detection_states:
        state = detection_states[camera_id]
        results = {
            'consecutive_accidents': state['consecutive_accidents'],
            'alert_trigger': state['alert_trigger'],
            'accident_free_frames': state['accident_free_frames'],
            'last_detected': state['last_detected'],
            'location': state['location'],
            'screenshot': state.get('screenshot')
        }
        return jsonify(results)
    return jsonify({}), 404


@app.route('/api/accidents', methods=['GET'])
def get_accidents():
    camera_id = request.args.get('camera_id')
    status_filter = request.args.get('status')

    try:
        query = {}
        if camera_id:
            query['cameraId'] = ObjectId(camera_id)
        if status_filter:
            query['status'] = status_filter

        accidents = list(accidents_collection.find(query).sort("time_detected", -1))

        for accident in accidents:
            accident['_id'] = str(accident['_id'])
            accident['cameraId'] = str(accident['cameraId'])

        return jsonify(accidents), 200
    except Exception as e:
        logging.error(f"Error fetching accidents: {e}")
        return jsonify({"error": "Error fetching accidents"}), 500


@app.route('/confirm_accident', methods=['POST'])
def confirm_accident():
    data = request.json
    accident_id = data.get('accident_id')
    is_false_alarm = data.get('isFalseAlarm', False)
    processed_by = data.get('processedBy', {})

    try:
        accident = accidents_collection.find_one({"_id": ObjectId(accident_id)})
        if not accident:
            return jsonify({"error": "Accident not found"}), 404

        update_data = {
            "isFalseAlarm": is_false_alarm,
            "processedBy": processed_by,
            "status": "false alarm" if is_false_alarm else "processed"
        }

        accidents_collection.update_one({"_id": ObjectId(accident_id)}, {"$set": update_data})

        notify_new_accident(update_data)

        return jsonify({"message": "Accident status updated successfully"}), 200
    except Exception as e:
        logging.error(f"Error updating accident status: {e}", exc_info=True)
        return jsonify({"error": "Error updating accident status"}), 500


@app.route("/start_processing", methods=["POST"])
def start_processing():
    video_sources = []
    cameras = cameras_collection.find()
    for camera in cameras:
        video_source = camera['cameraUrl']
        camera_id = str(camera['_id'])
        video_sources.append((video_source, camera_id))

    for video_source, camera_id in video_sources:
        thread = Thread(target=video_streaming, args=(video_source, camera_id))
        thread.start()

    return jsonify({"status": "Processing started for all cameras"})


@app.route("/shutdown", methods=["POST"])
async def shutdown():
    tasks = [pc.close() for pc in pcs]
    await asyncio.gather(*tasks)
    pcs.clear()
    return jsonify({"result": "shutdown"})


@socketio.on('connect')
def handle_connect():
    logging.info('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    logging.info('Client disconnected')


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')