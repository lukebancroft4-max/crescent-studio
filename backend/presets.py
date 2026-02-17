from models import Genre, Mood, MusicalKey, Instrument

GENRE_BPM_DEFAULTS: dict[Genre, int] = {
    Genre.HIPHOP: 90,
    Genre.TRAP: 140,
    Genre.LOFI: 80,
    Genre.EDM: 128,
    Genre.HOUSE: 124,
    Genre.DRILL: 145,
    Genre.RNB: 95,
    Genre.JAZZ: 110,
    Genre.AMBIENT: 70,
    Genre.AFROBEATS: 106,
    Genre.AMAPIANO: 112,
    Genre.AFRO_FUSION: 102,
}

GENRE_DESCRIPTIONS: dict[Genre, str] = {
    Genre.HIPHOP: "hip hop boom bap style beat with punchy drums",
    Genre.TRAP: "trap beat with 808 bass, hi-hat rolls, and hard-hitting snares",
    Genre.LOFI: "lo-fi chill hip hop beat with vinyl crackle and jazzy samples",
    Genre.EDM: "electronic dance music beat with synthesizers and build-ups",
    Genre.HOUSE: "house music beat with four-on-the-floor kick and groovy bassline",
    Genre.DRILL: "UK drill beat with sliding 808 bass and rapid hi-hats",
    Genre.RNB: "smooth R&B beat with lush pads and soulful melodies",
    Genre.JAZZ: "jazz-influenced beat with complex rhythms and melodic improvisation",
    Genre.AMBIENT: "ambient atmospheric beat with evolving textures and soft pads",
    Genre.AFROBEATS: "Nigerian Afrobeats instrumental with syncopated Afro swing drums, punchy kick, shakers, congas, talking drum accents, rolling Afro bassline, rhythmic guitar plucks",
    Genre.AMAPIANO: "Amapiano instrumental with deep log drum groove, syncopated percussion, jazz piano chords, airy pads, warm hypnotic dancefloor vibe",
    Genre.AFRO_FUSION: "Afro-fusion instrumental blending Afrobeat groove with modern production, live-feel instruments, soulful melodies, wide stereo percussion",
}


def get_presets() -> dict:
    return {
        "genres": [{"value": g.value, "label": g.value.replace("-", " ").title(), "default_bpm": GENRE_BPM_DEFAULTS[g]} for g in Genre],
        "moods": [{"value": m.value, "label": m.value.title()} for m in Mood],
        "keys": [{"value": k.value, "label": k.value} for k in MusicalKey],
        "instruments": [{"value": i.value, "label": i.value.title()} for i in Instrument],
        "duration_options": [30, 60, 90, 120, 150, 180],
    }
