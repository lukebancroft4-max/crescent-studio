import json
import os
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from models import GenerateRequest, BeatResponse, BeatHistoryItem, SfxRequest, PlanGenerateRequest
from presets import get_presets
from generator import (
    generate_beat, separate_stems, create_composition_plan,
    generate_from_plan, generate_sound_effect, OUTPUT_DIR,
)
from midi_converter import audio_to_midi
from plugin_router import router as plugin_router

app = FastAPI(title="Beat Generator AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plugin_router)

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
        beat_id, audio_path = generate_beat(request)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI generation failed: {e}")

    midi_path = OUTPUT_DIR / f"{beat_id}.mid"
    try:
        audio_to_midi(audio_path, midi_path, target_bpm=request.bpm)
    except Exception:
        pass  # Non-critical: MIDI conversion can fail gracefully

    response = BeatResponse(
        id=beat_id,
        audio_url=f"/api/export/audio/{beat_id}",
        midi_url=f"/api/export/midi/{beat_id}",
        stems_url=f"/api/stems/{beat_id}",
        params=request,
    )

    history.insert(0, {
        "id": beat_id,
        "params": request.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    if len(history) > 50:
        history.pop()
    save_history()

    return response


@app.get("/api/export/audio/{beat_id}")
def export_audio(beat_id: str):
    mp3_path = OUTPUT_DIR / f"{beat_id}.mp3"
    if mp3_path.exists():
        return FileResponse(mp3_path, media_type="audio/mpeg", filename=f"{beat_id}.mp3")
    wav_path = OUTPUT_DIR / f"{beat_id}.wav"
    if wav_path.exists():
        return FileResponse(wav_path, media_type="audio/wav", filename=f"{beat_id}.wav")
    raise HTTPException(status_code=404, detail="Beat not found")


@app.get("/api/export/midi/{beat_id}")
def export_midi(beat_id: str):
    midi_path = OUTPUT_DIR / f"{beat_id}.mid"
    if not midi_path.exists():
        raise HTTPException(status_code=404, detail="MIDI not found")
    return FileResponse(midi_path, media_type="audio/midi", filename=f"{beat_id}.mid")


@app.get("/api/history")
def get_history(limit: int = 50, offset: int = 0):
    subset = history[offset:offset + limit]
    return {"beats": subset, "total": len(history)}


@app.get("/api/status")
def get_status():
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    return {
        "api_key_configured": bool(api_key and len(api_key) > 5),
        "version": "1.0.0",
        "total_beats": len(history),
    }


# --- Stem separation endpoints ---

@app.post("/api/separate/{beat_id}")
def separate(beat_id: str):
    mp3_path = OUTPUT_DIR / f"{beat_id}.mp3"
    if not mp3_path.exists():
        raise HTTPException(status_code=404, detail="Beat not found")
    try:
        stems_dir = separate_stems(beat_id)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Stem separation failed: {e}")

    manifest_path = stems_dir / "stems.json"
    manifest = json.loads(manifest_path.read_text())
    return {"beat_id": beat_id, "stems": manifest["stems"]}


@app.get("/api/stems/{beat_id}")
def list_stems(beat_id: str):
    manifest_path = OUTPUT_DIR / f"{beat_id}_stems" / "stems.json"
    if not manifest_path.exists():
        raise HTTPException(status_code=404, detail="Stems not available")
    manifest = json.loads(manifest_path.read_text())
    return {"beat_id": beat_id, "stems": manifest["stems"]}


@app.get("/api/stems-zip/{beat_id}")
def download_all_stems(beat_id: str):
    zip_path = OUTPUT_DIR / f"{beat_id}_stems.zip"
    if not zip_path.exists():
        raise HTTPException(status_code=404, detail="Stems ZIP not found")
    return FileResponse(
        zip_path,
        media_type="application/zip",
        filename=f"{beat_id}_stems.zip",
    )


@app.get("/api/stems/{beat_id}/{stem_name:path}")
def get_stem(beat_id: str, stem_name: str):
    stem_path = OUTPUT_DIR / f"{beat_id}_stems" / stem_name
    if not stem_path.exists():
        raise HTTPException(status_code=404, detail="Stem not found")
    media_type = "audio/mpeg" if stem_name.endswith(".mp3") else "audio/wav"
    return FileResponse(stem_path, media_type=media_type, filename=stem_name)


# --- Composition plan endpoints ---

@app.post("/api/plan")
def make_plan(request: GenerateRequest):
    try:
        plan = create_composition_plan(request)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Plan generation failed: {e}")
    return plan


@app.post("/api/generate-from-plan")
def generate_from_plan_endpoint(body: PlanGenerateRequest):
    try:
        beat_id, audio_path = generate_from_plan(body.composition_plan, seed=body.seed)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Generation failed: {e}")

    midi_path = OUTPUT_DIR / f"{beat_id}.mid"
    try:
        audio_to_midi(audio_path, midi_path)
    except Exception:
        pass

    response = BeatResponse(
        id=beat_id,
        audio_url=f"/api/export/audio/{beat_id}",
        midi_url=f"/api/export/midi/{beat_id}",
        stems_url=f"/api/stems/{beat_id}",
    )

    history.insert(0, {
        "id": beat_id,
        "params": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    if len(history) > 50:
        history.pop()
    save_history()

    return response


# --- Sound effects endpoint ---

@app.post("/api/sfx")
def create_sfx(body: SfxRequest):
    try:
        sfx_id, path = generate_sound_effect(
            text=body.text,
            duration_seconds=body.duration,
            loop=body.loop,
            prompt_influence=body.prompt_influence,
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"SFX generation failed: {e}")
    return {"id": sfx_id, "audio_url": f"/api/export/audio/{sfx_id}"}
