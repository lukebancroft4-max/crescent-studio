import os
import uuid
from pathlib import Path

import httpx
from dotenv import load_dotenv

from models import GenerateRequest
from presets import GENRE_DESCRIPTIONS

load_dotenv()

OUTPUT_DIR = Path(__file__).parent.parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

API_KEY = os.getenv("ELEVENLABS_API_KEY")
API_URL = "https://api.elevenlabs.io/v1/music"
OUTPUT_FORMAT = "mp3_44100_192"
MODEL_ID = "music_v1"


def build_prompt(request: GenerateRequest) -> str:
    # If user provided a custom prompt, use it directly with BPM/key appended
    if request.custom_prompt.strip():
        return f"{request.custom_prompt.strip()}, {request.bpm} BPM, key of {request.key.value}"

    genre_desc = GENRE_DESCRIPTIONS.get(request.genre, request.genre.value)
    instruments_str = ", ".join(i.value for i in request.instruments)
    prompt = (
        f"{request.mood.value} {genre_desc}, "
        f"featuring {instruments_str}, "
        f"{request.bpm} BPM, key of {request.key.value}, "
        f"instrumental only"
    )
    return prompt


def generate_beat(request: GenerateRequest) -> tuple[str, Path]:
    """Generate a beat using ElevenLabs Music API. Returns (beat_id, mp3_path)."""
    if not API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set in .env")

    prompt = build_prompt(request)
    length_ms = request.duration * 1000

    url = f"{API_URL}?output_format={OUTPUT_FORMAT}"
    body = {
        "prompt": prompt,
        "music_length_ms": length_ms,
        "model_id": MODEL_ID,
        "force_instrumental": True,
    }

    response = httpx.post(
        url,
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
        },
        json=body,
        timeout=180.0,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"ElevenLabs API error {response.status_code}: {response.text[:500]}"
        )

    beat_id = uuid.uuid4().hex[:12]
    mp3_path = OUTPUT_DIR / f"{beat_id}.mp3"
    mp3_path.write_bytes(response.content)

    return beat_id, mp3_path
