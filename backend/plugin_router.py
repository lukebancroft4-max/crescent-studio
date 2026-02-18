import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from generator import OUTPUT_DIR
from plugin_scanner import scan_plugins, process_audio_through_plugins, load_plugin

router = APIRouter(prefix="/api/plugins")

# In-memory plugin cache
_cached_plugins = []


class ScanRequest(BaseModel):
    extra_dirs: list[str] = []


class PluginParam(BaseModel):
    path: str
    params: dict = {}


class ProcessRequest(BaseModel):
    beat_id: str
    stem_name: str
    plugin_chain: list[PluginParam]


@router.post("/scan")
def scan(body: ScanRequest):
    global _cached_plugins
    _cached_plugins = scan_plugins(extra_dirs=body.extra_dirs or None)
    return {"plugins": _cached_plugins, "count": len(_cached_plugins)}


@router.get("/list")
def list_plugins():
    return {"plugins": _cached_plugins, "count": len(_cached_plugins)}


@router.get("/{plugin_path:path}/params")
def get_plugin_params(plugin_path: str):
    try:
        plugin = load_plugin(plugin_path)
        params = {}
        for name in plugin.parameters.keys():
            p = plugin.parameters[name]
            params[name] = {
                "name": p.name if hasattr(p, "name") else name,
                "default_value": float(p.default_value) if hasattr(p, "default_value") else 0.0,
                "min_value": float(p.min_value) if hasattr(p, "min_value") else 0.0,
                "max_value": float(p.max_value) if hasattr(p, "max_value") else 1.0,
            }
        del plugin
        return {"path": plugin_path, "parameters": params}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to load plugin: {e}")


@router.post("/process")
def process_stem(body: ProcessRequest):
    stems_dir = OUTPUT_DIR / f"{body.beat_id}_stems"
    input_path = stems_dir / body.stem_name
    if not input_path.exists():
        raise HTTPException(status_code=404, detail="Stem not found")

    output_name = f"processed_{uuid.uuid4().hex[:8]}_{body.stem_name}"
    if not output_name.endswith(".wav"):
        output_name = output_name.rsplit(".", 1)[0] + ".wav"
    output_path = stems_dir / output_name

    try:
        chain = [{"path": p.path, "params": p.params} for p in body.plugin_chain]
        process_audio_through_plugins(input_path, output_path, chain)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {e}")

    return {
        "beat_id": body.beat_id,
        "stem_name": body.stem_name,
        "processed_stem": output_name,
        "url": f"/api/stems/{body.beat_id}/{output_name}",
    }
