import os
import cv2
import boto3

from dotenv import load_dotenv
from botocore.exceptions import NoCredentialsError

load_dotenv()

S3_ACCESS_KEY = os.getenv('S3_ACCESS_KEY')
S3_SECRET_KEY = os.getenv('S3_SECRET_KEY')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
S3_REGION = os.getenv('S3_REGION')
S3_FOLDER_NAME = 'back-screenshot/'


def upload_to_s3(frame, file_name):
    _, buffer = cv2.imencode('.jpg', frame)
    frame_bytes = buffer.tobytes()

    s3_client = boto3.client(
        's3',
        aws_access_key_id=S3_ACCESS_KEY,
        aws_secret_access_key=S3_SECRET_KEY,
        region_name=S3_REGION
    )

    try:
        s3_key = S3_FOLDER_NAME + file_name
        s3_client.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=frame_bytes,
            ACL='public-read',
            ContentType='image/jpeg'
        )
        print(f"Upload Successful: {s3_key}")
        return f"https://{S3_BUCKET_NAME}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
    except FileNotFoundError:
        print("File not found")
        return None
    except NoCredentialsError:
        print("Credentials not available")
        return None
    except Exception as e:
        print(f"Upload failed: {str(e)}")
        return None
