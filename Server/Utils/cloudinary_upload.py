import io
import os

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


def upload_video_to_cloudinary(video_bytes: bytes, public_id: str) -> str:
    """
    Upload raw video bytes to Cloudinary under the 'kineo/renders' folder.

    Args:
        video_bytes: Raw MP4 bytes returned by the Manim render.
        public_id:   Unique identifier for this asset (e.g. 'render_iter_0').

    Returns:
        The HTTPS secure URL of the uploaded video on Cloudinary.
    """
    result = cloudinary.uploader.upload(
        io.BytesIO(video_bytes),
        resource_type="video",
        folder="kineo/renders",
        public_id=public_id,
        overwrite=True,
    )
    return result["secure_url"]
