import platform
import traceback
from pathlib import Path

import numpy as np
import soundfile as sf
from pedalboard import Pedalboard, load_plugin


def get_vst3_search_dirs():
    system = platform.system()
    dirs = []
    if system == "Linux":
        dirs = [
            Path.home() / ".vst3",
            Path("/usr/lib/vst3"),
            Path("/usr/local/lib/vst3"),
        ]
    elif system == "Darwin":
        dirs = [
            Path("/Library/Audio/Plug-Ins/VST3"),
            Path.home() / "Library" / "Audio" / "Plug-Ins" / "VST3",
        ]
    elif system == "Windows":
        dirs = [
            Path(r"C:\Program Files\Common Files\VST3"),
        ]
    return [d for d in dirs if d.exists()]


def scan_plugins(extra_dirs=None):
    search_dirs = get_vst3_search_dirs()
    if extra_dirs:
        search_dirs.extend(Path(d) for d in extra_dirs if Path(d).exists())

    plugins = []
    seen = set()

    for search_dir in search_dirs:
        for vst3_path in search_dir.rglob("*.vst3"):
            path_str = str(vst3_path)
            if path_str in seen:
                continue
            seen.add(path_str)

            try:
                plugin = load_plugin(path_str)
                params = {}
                for name in plugin.parameters.keys():
                    p = plugin.parameters[name]
                    params[name] = {
                        "name": p.name if hasattr(p, "name") else name,
                        "default_value": float(p.default_value) if hasattr(p, "default_value") else 0.0,
                        "min_value": float(p.min_value) if hasattr(p, "min_value") else 0.0,
                        "max_value": float(p.max_value) if hasattr(p, "max_value") else 1.0,
                    }

                plugins.append({
                    "path": path_str,
                    "name": plugin.name if hasattr(plugin, "name") else vst3_path.stem,
                    "manufacturer": getattr(plugin, "manufacturer", "Unknown"),
                    "category": getattr(plugin, "category", ""),
                    "param_count": len(params),
                    "parameters": params,
                })
                del plugin
            except Exception:
                traceback.print_exc()
                continue

    return plugins


def process_audio_through_plugins(input_path, output_path, plugin_chain):
    """
    Process an audio file through a chain of VST3 plugins.

    plugin_chain: list of dicts with keys:
        - path: str (VST3 plugin path)
        - params: dict of param_name -> value
    """
    audio, sample_rate = sf.read(str(input_path), dtype="float32")
    if audio.ndim == 1:
        audio = np.expand_dims(audio, axis=0)
    else:
        audio = audio.T  # pedalboard expects (channels, samples)

    board = Pedalboard()

    for plugin_config in plugin_chain:
        try:
            plugin = load_plugin(plugin_config["path"])
            for param_name, value in (plugin_config.get("params") or {}).items():
                if param_name in plugin.parameters:
                    setattr(plugin, param_name, float(value))
            board.append(plugin)
        except Exception:
            traceback.print_exc()
            continue

    processed = board(audio, sample_rate)

    # Transpose back to (samples, channels) for soundfile
    if processed.ndim > 1:
        processed = processed.T

    sf.write(str(output_path), processed, sample_rate, format="WAV")
    return output_path
