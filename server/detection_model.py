import os
from ultralytics import YOLO
import cv2
from collections import defaultdict
import numpy as np
import torch
import asyncio
import time
import logging
from datetime import datetime
from model import insert_accident, get_camera_details
from bson import ObjectId
from upload import upload_to_s3


classNames = ["accident", "non-accident"]
device = 'cuda' if torch.cuda.is_available() else 'cpu'

model = YOLO("../server/YOLO-Weights/best.pt")
model.to(device)

confidence_threshold = 0.7

detection_states = {}
track_history = defaultdict(lambda: [])
frame_retain_default = 10
overlap_thres_default = 0.4
height_multiplier_default = 3


def initialize_detection_state(camera_id, location):
    if camera_id not in detection_states:
        detection_states[camera_id] = {
            'consecutive_accidents': 0,
            'alert_trigger': False,
            'accident_free_frames': 0,
            'last_detected': None,
            'location': location
        }


def manage_detection_states(camera_id, detected_accident, frame, location):
    logging.info(f"Managing detection state for camera {camera_id}, "
                 f"detected_accident: {detected_accident}, "
                 f"location: {location}")
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    state = detection_states.get(camera_id)

    if state is None:
        initialize_detection_state(camera_id, location)
        state = detection_states[camera_id]

    if detected_accident:
        state['consecutive_accidents'] += 1
        state['last_detected'] = current_time
        state['accident_free_frames'] = 0

        if state['consecutive_accidents'] >= 10 and not state['alert_trigger']:
            state['alert_trigger'] = True
            if 'screenshot' not in state or state['consecutive_accidents'] == 10:
                s3_image_url = upload_to_s3(frame, f"{camera_id}_{current_time}.jpg")
                state['screenshot'] = s3_image_url

                camera_details = get_camera_details(camera_id)
                accident_data = {
                    "time_detected": current_time,
                    "processedBy": None,
                    "cameraId": ObjectId(camera_id),
                    "cameraDetails": camera_details,
                    "location": location,
                    "status": "pending",
                    "isFalseAlarm": False,
                    "screenshot": s3_image_url
                }
                logging.info(f"Inserting accident data: {accident_data}")
                insert_accident(accident_data)
    else:
        state['accident_free_frames'] += 1

    if state['accident_free_frames'] >= 30:
        state['alert_trigger'] = False
        state['consecutive_accidents'] = 0
        state['accident_free_frames'] = 0


def process_frames(frames, camera_id, location):
    start_time = time.time()
    frames_rgb = [cv2.cvtColor(frame, cv2.COLOR_BGR2RGB) for frame in frames]

    results = model(frames_rgb)
    inference_time = time.time() - start_time
    logging.info(f"Batch inference time: {inference_time:.4f} seconds")

    processed_frames = []
    frame_counter = 0

    for frame, r in zip(frames, results):
        detected_accident = False
        for box in r.boxes:
            if box.conf[0] >= confidence_threshold:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cls = int(box.cls[0])
                class_name = classNames[cls]
                confidence = float(box.conf[0])

                if class_name == "accident":
                    detected_accident = True
                    color, thickness, text_thickness = (0, 0, 255), 2, 1
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)
                    label = f'{class_name} {confidence:.2f}'
                    cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, text_thickness)

                    if box.id is not None:
                        track_id = int(box.id[0])
                        track = track_history[track_id]
                        track.append((frame_counter, (x1 + x2) / 2, (y1 + y2) / 2))  # center point

                        points = np.array(track, dtype=np.float32)
                        points = points[points[:, 0] > (frame_counter - frame_retain_default)]

                        if len(points) >= 2:
                            points_width = np.abs(points[-1, 1] - points[0, 1])
                            points_height = np.abs(points[-1, 2] - points[0, 2])

                            if (x2 - x1) > (y2 - y1):
                                multiplier_ratio = (x2 - x1) / (y2 - y1) - 1
                                overlap = (points_width + points_height * height_multiplier_default * multiplier_ratio) / ((x2 - x1) + (y2 - y1))
                            else:
                                overlap = (points_width + points_height) / ((x2 - x1) + (y2 - y1))

                            if round(overlap, 4) > overlap_thres_default:
                                detected_accident = True

        manage_detection_states(camera_id, detected_accident, frame, location)
        processed_frames.append(frame)
        frame_counter += 1

    total_time = time.time() - start_time
    logging.info(f"Batch total processing time: {total_time:.4f} seconds")

    return processed_frames
