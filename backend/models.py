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
    AFROBEATS = "afrobeats"
    AMAPIANO = "amapiano"
    AFRO_FUSION = "afro-fusion"


class Mood(str, Enum):
    DARK = "dark"
    ENERGETIC = "energetic"
    CHILL = "chill"
    MELANCHOLIC = "melancholic"
    AGGRESSIVE = "aggressive"
    DREAMY = "dreamy"


class Instrument(str, Enum):
    DRUMS = "drums"
    BASS = "bass"
    MELODY = "melody"
    PAD = "pad"
    LOG_DRUM = "log drum"
    SHAKERS = "shakers"
    CONGAS = "congas"
    TALKING_DRUM = "talking drum"
    GUITAR = "guitar"
    PIANO = "piano"
    RHODES = "rhodes"
    HORNS = "horns"
    MARIMBA = "marimba"
    KALIMBA = "kalimba"
    ORGAN = "organ"
    FLUTE = "flute"
    CHORD_PROGRESSION = "chord progression"


class MusicalKey(str, Enum):
    C_MAJOR = "C major"
    C_MINOR = "C minor"
    CS_MAJOR = "C# major"
    CS_MINOR = "C# minor"
    D_MAJOR = "D major"
    D_MINOR = "D minor"
    DS_MAJOR = "D# major"
    DS_MINOR = "D# minor"
    E_MAJOR = "E major"
    E_MINOR = "E minor"
    F_MAJOR = "F major"
    F_MINOR = "F minor"
    FS_MAJOR = "F# major"
    FS_MINOR = "F# minor"
    G_MAJOR = "G major"
    G_MINOR = "G minor"
    GS_MAJOR = "G# major"
    GS_MINOR = "G# minor"
    A_MAJOR = "A major"
    A_MINOR = "A minor"
    AS_MAJOR = "A# major"
    AS_MINOR = "A# minor"
    B_MAJOR = "B major"
    B_MINOR = "B minor"


class GenerateRequest(BaseModel):
    genre: Genre
    bpm: int = Field(ge=60, le=200, default=120)
    mood: Mood
    key: MusicalKey = MusicalKey.C_MINOR
    duration: int = Field(default=120, ge=15, le=180)
    instruments: list[Instrument] = Field(min_length=1)
    custom_prompt: str = Field(default="", max_length=2000)
    seed: int | None = None


class BeatResponse(BaseModel):
    id: str
    audio_url: str
    midi_url: str
    stems_url: str | None = None
    params: GenerateRequest | None = None


class BeatHistoryItem(BaseModel):
    id: str
    params: GenerateRequest | None = None
    created_at: str


class SfxRequest(BaseModel):
    text: str = Field(max_length=500)
    duration: float = Field(default=2.0, ge=0.5, le=30.0)
    loop: bool = False
    prompt_influence: float = Field(default=0.5, ge=0.0, le=1.0)


class PlanGenerateRequest(BaseModel):
    composition_plan: dict
    seed: int | None = None
