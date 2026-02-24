#pragma once
#include "models.h"
#include <map>
#include <string>

inline const std::map<Genre, int>& genre_bpm_defaults() {
    static const std::map<Genre, int> m = {
        {Genre::HIPHOP, 90}, {Genre::TRAP, 140}, {Genre::LOFI, 80},
        {Genre::EDM, 128}, {Genre::HOUSE, 124}, {Genre::DRILL, 145},
        {Genre::RNB, 95}, {Genre::JAZZ, 110}, {Genre::AMBIENT, 70},
        {Genre::AFROBEATS, 106}, {Genre::AMAPIANO, 112}, {Genre::AFRO_FUSION, 102},
        {Genre::HIGHLIFE, 115}, {Genre::JUJU, 108}, {Genre::FUJI, 118},
        {Genre::AFROBEAT_CLASSIC, 120}, {Genre::SOUKOUS, 135}, {Genre::MAKOSSA, 122},
        {Genre::AFRO_HOUSE, 122}, {Genre::GQOM, 152}, {Genre::KUDURO, 136},
        {Genre::MBALAX, 116}, {Genre::KWAITO, 108}, {Genre::NDOMBOLO, 130},
    };
    return m;
}

inline const std::map<Genre, std::string>& genre_descriptions() {
    static const std::map<Genre, std::string> m = {
        {Genre::HIPHOP,      "hip hop boom bap style beat with punchy drums"},
        {Genre::TRAP,        "trap beat with 808 bass, hi-hat rolls, and hard-hitting snares"},
        {Genre::LOFI,        "lo-fi chill hip hop beat with vinyl crackle and jazzy samples"},
        {Genre::EDM,         "electronic dance music beat with synthesizers and build-ups"},
        {Genre::HOUSE,       "house music beat with four-on-the-floor kick and groovy bassline"},
        {Genre::DRILL,       "UK drill beat with sliding 808 bass and rapid hi-hats"},
        {Genre::RNB,         "smooth R&B beat with lush pads and soulful melodies"},
        {Genre::JAZZ,        "jazz-influenced beat with complex rhythms and melodic improvisation"},
        {Genre::AMBIENT,     "ambient atmospheric beat with evolving textures and soft pads"},
        {Genre::AFROBEATS,   "Nigerian Afrobeats instrumental with syncopated Afro swing drums, punchy kick, shakers, congas, talking drum accents, rolling Afro bassline, rhythmic guitar plucks"},
        {Genre::AMAPIANO,    "Amapiano instrumental with deep log drum groove, syncopated percussion, jazz piano chords, airy pads, warm hypnotic dancefloor vibe"},
        {Genre::AFRO_FUSION, "Afro-fusion instrumental blending Afrobeat groove with modern production, live-feel instruments, soulful melodies, wide stereo percussion"},
        {Genre::HIGHLIFE,         "Ghanaian Highlife instrumental with bright brass section, palm wine guitar picking, steady 6/8 bell pattern, warm bass groove, jazzy horn melodies, danceable West African swing feel"},
        {Genre::JUJU,             "Nigerian Juju music instrumental with layered talking drum patterns, call-and-response percussion, interlocking guitar lines, steel guitar accents, shekere groove, Yoruba praise rhythm"},
        {Genre::FUJI,             "Nigerian Fuji percussion instrumental with sakara drum ensemble, talking drum solos, dundun bass rhythm, shekere and shakers layered polyrhythm, Yoruba chant energy, no guitars or bass guitar"},
        {Genre::AFROBEAT_CLASSIC, "Classic Afrobeat instrumental in the style of Fela Kuti and Tony Allen with polyrhythmic broken kick drum pattern, relentless ride cymbal, horn section stabs, jazz organ chords, clave-based percussion, hypnotic Afro groove"},
        {Genre::SOUKOUS,          "Congolese Soukous instrumental with fast sebene guitar arpeggios, driving snare rhythm, rumba-inspired bass, bright horn arrangements, rapid fingerpicking, energetic Central African dance groove"},
        {Genre::MAKOSSA,          "Cameroonian Makossa instrumental with heavy syncopated bass guitar, punchy kick drum interlock, horn-driven melody, cowbell accent pattern, funky offbeat rhythm, Douala dance groove"},
        {Genre::AFRO_HOUSE,       "Afro-House instrumental with four-on-the-floor kick drum, deep electronic bass, layered African percussion, djembe accents, conga upbeats, shaker sixteenth notes, warm dancefloor atmosphere"},
        {Genre::GQOM,             "South African Gqom instrumental with dark distorted kick on the one, raw broken beat, minimal sparse percussion, aggressive bass drops, industrial Durban dance music energy"},
        {Genre::KUDURO,           "Angolan Kuduro instrumental with hard-hitting electronic kick on every beat, rapid hi-hat triplet rolls, tribal percussion accents, tarraxo bass wobble, fast aggressive Luanda dance energy"},
        {Genre::MBALAX,           "Senegalese Mbalax instrumental with driving sabar drum lead patterns, tama talking drum accents, complex polyrhythmic layers, balafon melodic percussion, West African griot rhythm tradition"},
        {Genre::KWAITO,           "South African Kwaito instrumental with slow deep house tempo, heavy sub bass, sparse percussion hits, wide open rhythmic spacing, township groove, laid-back Johannesburg street feel"},
        {Genre::NDOMBOLO,         "Congolese Ndombolo instrumental with fast driving snare rolls and flams, busy hi-hat patterns, rhythmic guitar riffs, horn stabs, cowbell accent, energetic Kinshasa party dance groove"},
    };
    return m;
}

inline const std::vector<std::string>& all_instruments() {
    static const std::vector<std::string> v = {
        "drums", "bass", "melody", "pad", "log drum", "shakers", "congas",
        "talking drum", "guitar", "piano", "rhodes", "horns", "marimba",
        "kalimba", "organ", "flute", "chord progression",
        "djembe", "dundun", "shekere", "bata drums", "udu drum",
        "agogo bells", "cowbell", "gankogui", "balafon", "bougarabou",
        "sakara drum", "axatse",
    };
    return v;
}

inline const std::vector<int>& duration_options() {
    static const std::vector<int> v = {30, 60, 90, 120, 150, 180};
    return v;
}

inline const std::map<Genre, std::vector<std::string>>& genre_default_instruments() {
    static const std::map<Genre, std::vector<std::string>> m = {
        {Genre::HIPHOP,          {"drums", "bass", "melody", "pad"}},
        {Genre::TRAP,            {"drums", "bass", "melody", "pad"}},
        {Genre::LOFI,            {"drums", "bass", "piano", "melody"}},
        {Genre::EDM,             {"drums", "bass", "melody", "pad"}},
        {Genre::HOUSE,           {"drums", "bass", "pad", "melody"}},
        {Genre::DRILL,           {"drums", "bass", "melody", "pad"}},
        {Genre::RNB,             {"drums", "bass", "pad", "melody", "rhodes"}},
        {Genre::JAZZ,            {"drums", "bass", "piano", "horns"}},
        {Genre::AMBIENT,         {"pad", "melody", "drums", "flute"}},
        {Genre::AFROBEATS,       {"drums", "bass", "shakers", "congas", "talking drum", "guitar"}},
        {Genre::AMAPIANO,        {"drums", "bass", "log drum", "piano", "pad", "shakers"}},
        {Genre::AFRO_FUSION,     {"drums", "bass", "guitar", "congas", "shakers", "pad", "melody"}},
        {Genre::HIGHLIFE,        {"drums", "bass", "guitar", "horns", "agogo bells", "congas", "shakers"}},
        {Genre::JUJU,            {"drums", "bass", "guitar", "talking drum", "agogo bells", "shakers", "pad"}},
        {Genre::FUJI,            {"drums", "dundun", "talking drum", "sakara drum", "shekere", "congas"}},
        {Genre::AFROBEAT_CLASSIC,{"drums", "bass", "guitar", "horns", "organ", "congas", "shekere", "gankogui"}},
        {Genre::SOUKOUS,         {"drums", "bass", "guitar", "horns", "congas", "cowbell", "shakers"}},
        {Genre::MAKOSSA,         {"drums", "bass", "guitar", "horns", "cowbell", "congas"}},
        {Genre::AFRO_HOUSE,      {"drums", "bass", "pad", "shakers", "congas", "djembe", "cowbell"}},
        {Genre::GQOM,            {"drums", "bass", "pad", "shakers"}},
        {Genre::KUDURO,          {"drums", "bass", "pad", "cowbell", "shakers", "agogo bells"}},
        {Genre::MBALAX,          {"drums", "bass", "guitar", "talking drum", "djembe", "bougarabou", "balafon"}},
        {Genre::KWAITO,          {"drums", "bass", "pad", "shakers", "cowbell"}},
        {Genre::NDOMBOLO,        {"drums", "bass", "guitar", "horns", "congas", "cowbell", "shakers"}},
    };
    return m;
}
