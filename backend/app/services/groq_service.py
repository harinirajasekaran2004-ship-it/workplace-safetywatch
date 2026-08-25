import json
import logging
import base64
import os
import re
from typing import Dict, Any, Optional, List
from groq import Groq
from app.config import settings

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client: Optional[Groq] = None
        if self.api_key:
            try:
                self.client = Groq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
                self.client = None

    def is_available(self) -> bool:
        return self.client is not None and bool(self.api_key)

    def generate_json_response(
        self,
        system_prompt: str,
        user_prompt: str,
        image_base64: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.1
    ) -> Dict[str, Any]:
        """
        Calls Groq API (Vision or Text) requesting a strict JSON response.
        If Groq is unavailable, fallback heuristic logic is applied.
        """
        if not self.is_available():
            logger.info("Groq API key not set or client unavailable; using safety intelligence heuristic engine.")
            return {}

        chosen_model = model or (settings.GROQ_VISION_MODEL if image_base64 else settings.GROQ_TEXT_MODEL)

        messages = [
            {"role": "system", "content": system_prompt + "\nYou must return ONLY valid, parseable JSON. Do not include markdown ticks or text outside the JSON object."}
        ]

        if image_base64:
            # Prepare multimodal vision message
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}" if not image_base64.startswith("data:") else image_base64
                        }
                    }
                ]
            })
        else:
            messages.append({"role": "user", "content": user_prompt})

        try:
            chat_completion = self.client.chat.completions.create(
                messages=messages,
                model=chosen_model,
                temperature=temperature,
                response_format={"type": "json_object"}
            )
            raw_content = chat_completion.choices[0].message.content.strip()
            
            # Clean markdown if present
            if raw_content.startswith("```"):
                raw_content = re.sub(r"^```(?:json)?\n?", "", raw_content)
                raw_content = re.sub(r"\n?```$", "", raw_content)
            
            return json.loads(raw_content)
        except Exception as e:
            logger.error(f"Groq API call error ({chosen_model}): {e}")
            raise e

groq_service = GroqService()
