import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from models import GenerateRequest, BeatResponse, BeatHistoryItem
from presets import get_presets
from generator import generate_beat, OUTPUT_DIR
from audio_processor import normalize_audio
from midi_converter import audio_to_midi

app = FastAPI(title="Beat Generator AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory history (simple list, no DB needed)
history: list[dict] = []

HISTORY_FILE = OUTPUT_DIR / "history.json"


def load_history():
    global history
    if HISTORY_FILE.exists():
        history = json.loads(HISTORY_FILE.read_text())


def save_history():
    HISTORY_FILE.write_text(json.dumps(history, indent=2))


load_history()


@app.get("/api/presets")
def get_preset_options():
    return get_presets()


@app.post("/api/generate", response_model=BeatResponse)
def generate(request: GenerateRequest):
    try:
        beat_id, wav_path = generate_beat(request)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI generation failed: {e}")

    try:
        normalize_audio(wav_path)
    except Exception:
        pass  # Non-critical: skip normalization if it fails

    midi_path = OUTPUT_DIR / f"{beat_id}.mid"
    try:
        audio_to_midi(wav_path, midi_path, target_bpm=request.bpm)
    except Exception:
        pass  # Non-critical: MIDI conversion can fail gracefully

    response = BeatResponse(
        id=beat_id,
        audio_url=f"/api/export/wav/{beat_id}",
        midi_url=f"/api/export/midi/{beat_id}",
        params=request,
    )

    history.insert(0, {
        "id": beat_id,
        "params": request.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Keep last 50
    if len(history) > 50:
        history.pop()
    save_history()

    return response


@app.get("/api/export/wav/{beat_id}")
def export_wav(beat_id: str):
    wav_path = OUTPUT_DIR / f"{beat_id}.wav"
    if not wav_path.exists():
        raise HTTPException(status_code=404, detail="Beat not found")
    return FileResponse(wav_path, media_type="audio/wav", filename=f"{beat_id}.wav")


@app.get("/api/export/midi/{beat_id}")
def export_midi(beat_id: str):
    midi_path = OUTPUT_DIR / f"{beat_id}.mid"
    if not midi_path.exists():
        raise HTTPException(status_code=404, detail="MIDI not found")
    return FileResponse(midi_path, media_type="audio/midi", filename=f"{beat_id}.mid")


@app.get("/api/history", response_model=list[BeatHistoryItem])
def get_history():
    return history[:20]
