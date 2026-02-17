from pydantic import BaseModel, Field
from enum import Enum


class Genre(str, Enum):
    HIPHOP = "hip-hop"
    TRAP = "trap"
    LOFI = "lo-fi"
    EDM = "edm"
    HOUSE = "house"
    DRILL = "drill"
    RNB = "r&b"
    JAZZ = "jazz"
    AMBIENT = "ambient"


class Mood(str, Enum):
    DARK = "dark"
    ENERGETIC = "energetic"
    CHILL = "chill"
    MELANCHOLIC = "melancholic"
    AGGRESSIVE = "aggressive"
    DREAMY = "dreamy"


class MusicalKey(str, Enum):
    C_MAJOR = "C major"
    C_MINOR = "C minor"
    D_MAJOR = "D major"
    D_MINOR = "D minor"
    E_MAJOR = "E major"
    E_MINOR = "E minor"
    F_MAJOR = "F major"
    F_MINOR = "F minor"
    G_MAJOR = "G major"
    G_MINOR = "G minor"
    A_MAJOR = "A major"
    A_MINOR = "A minor"
    B_MAJOR = "B major"
    B_MINOR = "B minor"


class Instrument(str, Enum):
    DRUMS = "drums"
    BASS = "bass"
    MELODY = "melody"
    PAD = "pad"


class GenerateRequest(BaseModel):
    genre: Genre
    bpm: int = Field(ge=60, le=200, default=120)
    mood: Mood
    key: MusicalKey = MusicalKey.C_MINOR
    duration: int = Field(default=30, description="Duration in seconds (15, 30, or 60)")
    instruments: list[Instrument] = Field(min_length=1)


class BeatResponse(BaseModel):
    id: str
    audio_url: str
    midi_url: str
    params: GenerateRequest


class BeatHistoryItem(BaseModel):
    id: str
    params: GenerateRequest
    created_at: str
