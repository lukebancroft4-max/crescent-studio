import os
import uuid
import struct
import io
from pathlib import Path

from huggingface_hub import InferenceClient
from dotenv import load_dotenv

from models import GenerateRequest
from presets import GENRE_DESCRIPTIONS

load_dotenv()

OUTPUT_DIR = Path(__file__).parent.parent / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

HF_TOKEN = os.getenv("HF_API_TOKEN")
MODEL = os.getenv("MUSICGEN_MODEL", "facebook/musicgen-small")


def build_prompt(request: GenerateRequest) -> str:
    genre_desc = GENRE_DESCRIPTIONS.get(request.genre, request.genre.value)
    instruments_str = ", ".join(i.value for i in request.instruments)
    prompt = (
        f"{request.mood.value} {genre_desc} "
        f"at {request.bpm} BPM in the key of {request.key.value}, "
        f"featuring {instruments_str}"
    )
    return prompt


def generate_beat(request: GenerateRequest) -> tuple[str, Path]:
    """Generate a beat using HuggingFace MusicGen. Returns (beat_id, wav_path)."""
    client = InferenceClient(token=HF_TOKEN)
    prompt = build_prompt(request)

    audio_bytes = client.text_to_audio(
        prompt,
        model=MODEL,
    )

    beat_id = uuid.uuid4().hex[:12]
    wav_path = OUTPUT_DIR / f"{beat_id}.wav"

    # audio_bytes is raw bytes - save as WAV
    if isinstance(audio_bytes, bytes):
        wav_path.write_bytes(audio_bytes)
    elif hasattr(audio_bytes, "read"):
        wav_path.write_bytes(audio_bytes.read())
    else:
        # It might be a tuple of (sample_rate, numpy_array)
        import numpy as np
        import soundfile as sf
        if isinstance(audio_bytes, tuple):
            sr, data = audio_bytes
            if isinstance(data, list):
                data = np.array(data)
            sf.write(str(wav_path), data, sr)
        else:
            wav_path.write_bytes(bytes(audio_bytes))

    return beat_id, wav_path
