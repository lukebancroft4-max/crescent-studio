import io
import json
import os
import uuid
import zipfile
from pathlib import Path

import httpx
from dotenv import load_dotenv

from models import GenerateRequest
from presets import GENRE_DESCRIPTIONS

load_dotenv()

OUTPUT_DIR = Path(os.environ.get("CRESCENT_OUTPUT_DIR", str(Path(__file__).parent.parent / "output")))
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


def separate_stems(beat_id: str) -> Path:
    """Separate a generated beat into 6 stems using ElevenLabs API.
    Returns the stems directory path."""
    if not API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set in .env")

    mp3_path = OUTPUT_DIR / f"{beat_id}.mp3"
    if not mp3_path.exists():
        raise FileNotFoundError(f"Audio not found for beat {beat_id}")

    stems_dir = OUTPUT_DIR / f"{beat_id}_stems"
    if stems_dir.exists() and (stems_dir / "stems.json").exists():
        return stems_dir  # Already separated

    with open(mp3_path, "rb") as f:
        response = httpx.post(
            "https://api.elevenlabs.io/v1/music/stem-separation",
            headers={"xi-api-key": API_KEY},
            files={"file": (f"{beat_id}.mp3", f, "audio/mpeg")},
            data={"stem_variation_id": "six_stems_v1"},
            params={"output_format": OUTPUT_FORMAT},
            timeout=300.0,
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"Stem separation failed {response.status_code}: {response.text[:500]}"
        )

    # Save raw ZIP for download
    zip_path = OUTPUT_DIR / f"{beat_id}_stems.zip"
    zip_path.write_bytes(response.content)

    # Extract individual stems
    stems_dir.mkdir(exist_ok=True)
    with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
        stem_names = []
        for name in zf.namelist():
            if name.endswith((".mp3", ".wav", ".opus")):
                zf.extract(name, stems_dir)
                stem_names.append(name)

    # Write manifest
    manifest = {"beat_id": beat_id, "stems": stem_names}
    (stems_dir / "stems.json").write_text(json.dumps(manifest, indent=2))

    return stems_dir


def create_composition_plan(request: GenerateRequest) -> dict:
    """Generate a structured composition plan (FREE, no credits)."""
    if not API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set in .env")

    prompt = build_prompt(request)
    length_ms = request.duration * 1000

    response = httpx.post(
        "https://api.elevenlabs.io/v1/music/plan",
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "prompt": prompt,
            "music_length_ms": length_ms,
            "model_id": MODEL_ID,
        },
        timeout=60.0,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"Composition plan failed {response.status_code}: {response.text[:500]}"
        )

    return response.json()


def generate_from_plan(composition_plan: dict, seed: int | None = None) -> tuple[str, Path]:
    """Generate audio from a composition plan."""
    if not API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set in .env")

    body = {
        "composition_plan": composition_plan,
        "model_id": MODEL_ID,
        "force_instrumental": True,
    }
    if seed is not None:
        body["seed"] = seed

    url = f"{API_URL}?output_format={OUTPUT_FORMAT}"
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
            f"Generation from plan failed {response.status_code}: {response.text[:500]}"
        )

    beat_id = uuid.uuid4().hex[:12]
    mp3_path = OUTPUT_DIR / f"{beat_id}.mp3"
    mp3_path.write_bytes(response.content)
    return beat_id, mp3_path


def generate_sound_effect(
    text: str,
    duration_seconds: float = 2.0,
    loop: bool = False,
    prompt_influence: float = 0.5,
) -> tuple[str, Path]:
    """Generate a sound effect from text description."""
    if not API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not set in .env")

    response = httpx.post(
        "https://api.elevenlabs.io/v1/sound-generation",
        headers={
            "xi-api-key": API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "text": text,
            "duration_seconds": duration_seconds,
            "loop": loop,
            "prompt_influence": prompt_influence,
        },
        timeout=60.0,
    )

    if response.status_code != 200:
        raise RuntimeError(
            f"SFX generation failed {response.status_code}: {response.text[:500]}"
        )

    sfx_id = f"sfx_{uuid.uuid4().hex[:8]}"
    mp3_path = OUTPUT_DIR / f"{sfx_id}.mp3"
    mp3_path.write_bytes(response.content)
    return sfx_id, mp3_path
