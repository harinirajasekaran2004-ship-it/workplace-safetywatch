import logging
from typing import Optional
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger(__name__)

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.client: Optional[Client] = None
        
        if self.url and self.key and not self.url.startswith("https://your-project"):
            try:
                self.client = create_client(self.url, self.key)
                logger.info("Connected to Supabase PostgreSQL database.")
            except Exception as e:
                logger.warning(f"Failed to connect to Supabase: {e}")
                self.client = None

    def is_connected(self) -> bool:
        return self.client is not None

    def upload_image(self, file_bytes: bytes, file_name: str, content_type: str = "image/jpeg") -> Optional[str]:
        """Uploads an image to Supabase Storage bucket and returns public/signed URL."""
        if not self.is_connected():
            return None
        try:
            bucket = settings.SUPABASE_STORAGE_BUCKET
            res = self.client.storage.from_(bucket).upload(
                path=file_name,
                file=file_bytes,
                file_options={"content-type": content_type, "upsert": "true"}
            )
            # Retrieve public URL
            public_url = self.client.storage.from_(bucket).get_public_url(file_name)
            return public_url
        except Exception as e:
            logger.error(f"Failed to upload image to Supabase Storage: {e}")
            return None

supabase_service = SupabaseService()
