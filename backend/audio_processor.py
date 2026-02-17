from pathlib import Path

import librosa
import numpy as np
import soundfile as sf


def normalize_audio(wav_path: Path) -> Path:
    """Normalize audio levels to prevent clipping."""
    data, sr = librosa.load(str(wav_path), sr=None)

    peak = np.max(np.abs(data))
    if peak > 0:
        data = data / peak * 0.95

    sf.write(str(wav_path), data, sr)
    return wav_path


def detect_beats(wav_path: Path) -> tuple[float, np.ndarray, np.ndarray]:
    """Detect BPM and beat/onset positions in audio.

    Returns (estimated_bpm, beat_times, onset_times).
    """
    y, sr = librosa.load(str(wav_path), sr=None)

    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    bpm = float(tempo) if np.isscalar(tempo) else float(tempo[0])

    return bpm, beat_times, onset_times
