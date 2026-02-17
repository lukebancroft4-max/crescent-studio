from pathlib import Path

import numpy as np
from midiutil import MIDIFile

from audio_processor import detect_beats


# General MIDI drum map
KICK = 36
SNARE = 38
CLOSED_HH = 42
OPEN_HH = 46


def audio_to_midi(wav_path: Path, output_path: Path, target_bpm: int = 120) -> Path:
    """Convert detected beats/onsets from audio to a MIDI drum pattern."""
    bpm, beat_times, onset_times = detect_beats(wav_path)

    midi = MIDIFile(1)
    track = 0
    channel = 9  # MIDI drum channel
    midi.addTrackName(track, 0, "Beat Generator Drums")
    midi.addTempo(track, 0, target_bpm)

    beats_per_second = target_bpm / 60.0

    # Map beat positions to kick and snare (alternating)
    for i, t in enumerate(beat_times):
        beat_position = t * beats_per_second
        note = KICK if i % 2 == 0 else SNARE
        midi.addNote(track, channel, note, beat_position, 0.25, 100)

    # Map onsets to hi-hats
    for t in onset_times:
        beat_position = t * beats_per_second
        midi.addNote(track, channel, CLOSED_HH, beat_position, 0.125, 80)

    with open(output_path, "wb") as f:
        midi.writeFile(f)

    return output_path
