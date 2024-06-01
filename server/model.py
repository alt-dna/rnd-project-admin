from pymongo import MongoClient
import os
from dotenv import load_dotenv
from bson import ObjectId
import logging

load_dotenv()

client = MongoClient(os.getenv("MONGODB_URI"))
db = client['test']

cameras_collection = db['cameras']
accidents_collection = db['accidents']
admins_collection = db['admins']


# print(client.list_database_names())
# print(db.list_collection_names())

def insert_accident(accident_data):
    try:
        result = accidents_collection.insert_one(accident_data)
        logging.info(f"Accident data inserted with id: {result.inserted_id}")
    except Exception as e:
        logging.error(f"Error inserting accident data: {e}")


def find_accidents():
    try:
        accidents = list(accidents_collection.find())
        logging.info(f"Found accidents: {accidents}")
        return accidents
    except Exception as e:
        logging.error(f"Error finding accidents: {e}", exc_info=True)
        return []


def get_camera_details(camera_id):
    try:
        camera = cameras_collection.find_one({"_id": ObjectId(camera_id)})
        if camera:
            return {
                "cameraName": camera.get("cameraName"),
                "cameraFullAddress": camera.get("cameraFullAddress")
            }
    except Exception as e:
        logging.error(f"Error retrieving camera details: {e}")
    return {"cameraName": "Unknown", "cameraFullAddress": "Unknown"}
