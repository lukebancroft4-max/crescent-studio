#pragma once
#include <string>
#include <vector>
#include <map>

enum class Genre {
    HIPHOP, TRAP, LOFI, EDM, HOUSE, DRILL,
    RNB, JAZZ, AMBIENT, AFROBEATS, AMAPIANO, AFRO_FUSION,
    HIGHLIFE, JUJU, FUJI, AFROBEAT_CLASSIC, SOUKOUS, MAKOSSA,
    AFRO_HOUSE, GQOM, KUDURO, MBALAX, KWAITO, NDOMBOLO
};

enum class Mood {
    DARK, ENERGETIC, CHILL, MELANCHOLIC, AGGRESSIVE, DREAMY
};

enum class MusicalKey {
    C_MAJOR, C_MINOR, CS_MAJOR, CS_MINOR,
    D_MAJOR, D_MINOR, DS_MAJOR, DS_MINOR,
    E_MAJOR, E_MINOR, F_MAJOR, F_MINOR,
    FS_MAJOR, FS_MINOR, G_MAJOR, G_MINOR,
    GS_MAJOR, GS_MINOR, A_MAJOR, A_MINOR,
    AS_MAJOR, AS_MINOR, B_MAJOR, B_MINOR
};

inline const char* genre_to_str(Genre g) {
    switch (g) {
        case Genre::HIPHOP:      return "hip-hop";
        case Genre::TRAP:        return "trap";
        case Genre::LOFI:        return "lo-fi";
        case Genre::EDM:         return "edm";
        case Genre::HOUSE:       return "house";
        case Genre::DRILL:       return "drill";
        case Genre::RNB:         return "r&b";
        case Genre::JAZZ:        return "jazz";
        case Genre::AMBIENT:     return "ambient";
        case Genre::AFROBEATS:   return "afrobeats";
        case Genre::AMAPIANO:    return "amapiano";
        case Genre::AFRO_FUSION: return "afro-fusion";
        case Genre::HIGHLIFE:         return "highlife";
        case Genre::JUJU:             return "juju";
        case Genre::FUJI:             return "fuji";
        case Genre::AFROBEAT_CLASSIC: return "afrobeat-classic";
        case Genre::SOUKOUS:          return "soukous";
        case Genre::MAKOSSA:          return "makossa";
        case Genre::AFRO_HOUSE:       return "afro-house";
        case Genre::GQOM:             return "gqom";
        case Genre::KUDURO:           return "kuduro";
        case Genre::MBALAX:           return "mbalax";
        case Genre::KWAITO:           return "kwaito";
        case Genre::NDOMBOLO:         return "ndombolo";
    }
    return "unknown";
}

inline Genre genre_from_str(const std::string& s) {
    static const std::map<std::string, Genre> m = {
        {"hip-hop", Genre::HIPHOP}, {"trap", Genre::TRAP}, {"lo-fi", Genre::LOFI},
        {"edm", Genre::EDM}, {"house", Genre::HOUSE}, {"drill", Genre::DRILL},
        {"r&b", Genre::RNB}, {"jazz", Genre::JAZZ}, {"ambient", Genre::AMBIENT},
        {"afrobeats", Genre::AFROBEATS}, {"amapiano", Genre::AMAPIANO}, {"afro-fusion", Genre::AFRO_FUSION},
        {"highlife", Genre::HIGHLIFE}, {"juju", Genre::JUJU}, {"fuji", Genre::FUJI},
        {"afrobeat-classic", Genre::AFROBEAT_CLASSIC}, {"soukous", Genre::SOUKOUS},
        {"makossa", Genre::MAKOSSA}, {"afro-house", Genre::AFRO_HOUSE},
        {"gqom", Genre::GQOM}, {"kuduro", Genre::KUDURO},
        {"mbalax", Genre::MBALAX}, {"kwaito", Genre::KWAITO}, {"ndombolo", Genre::NDOMBOLO},
    };
    auto it = m.find(s);
    return it != m.end() ? it->second : Genre::HIPHOP;
}

inline const char* mood_to_str(Mood m) {
    switch (m) {
        case Mood::DARK:        return "dark";
        case Mood::ENERGETIC:   return "energetic";
        case Mood::CHILL:       return "chill";
        case Mood::MELANCHOLIC: return "melancholic";
        case Mood::AGGRESSIVE:  return "aggressive";
        case Mood::DREAMY:      return "dreamy";
    }
    return "chill";
}

inline Mood mood_from_str(const std::string& s) {
    static const std::map<std::string, Mood> m = {
        {"dark", Mood::DARK}, {"energetic", Mood::ENERGETIC}, {"chill", Mood::CHILL},
        {"melancholic", Mood::MELANCHOLIC}, {"aggressive", Mood::AGGRESSIVE}, {"dreamy", Mood::DREAMY},
    };
    auto it = m.find(s);
    return it != m.end() ? it->second : Mood::CHILL;
}

inline const char* key_to_str(MusicalKey k) {
    static const char* names[] = {
        "C major","C minor","C# major","C# minor",
        "D major","D minor","D# major","D# minor",
        "E major","E minor","F major","F minor",
        "F# major","F# minor","G major","G minor",
        "G# major","G# minor","A major","A minor",
        "A# major","A# minor","B major","B minor",
    };
    return names[static_cast<int>(k)];
}

inline MusicalKey key_from_str(const std::string& s) {
    static const std::map<std::string, MusicalKey> m = {
        {"C major", MusicalKey::C_MAJOR}, {"C minor", MusicalKey::C_MINOR},
        {"C# major", MusicalKey::CS_MAJOR}, {"C# minor", MusicalKey::CS_MINOR},
        {"D major", MusicalKey::D_MAJOR}, {"D minor", MusicalKey::D_MINOR},
        {"D# major", MusicalKey::DS_MAJOR}, {"D# minor", MusicalKey::DS_MINOR},
        {"E major", MusicalKey::E_MAJOR}, {"E minor", MusicalKey::E_MINOR},
        {"F major", MusicalKey::F_MAJOR}, {"F minor", MusicalKey::F_MINOR},
        {"F# major", MusicalKey::FS_MAJOR}, {"F# minor", MusicalKey::FS_MINOR},
        {"G major", MusicalKey::G_MAJOR}, {"G minor", MusicalKey::G_MINOR},
        {"G# major", MusicalKey::GS_MAJOR}, {"G# minor", MusicalKey::GS_MINOR},
        {"A major", MusicalKey::A_MAJOR}, {"A minor", MusicalKey::A_MINOR},
        {"A# major", MusicalKey::AS_MAJOR}, {"A# minor", MusicalKey::AS_MINOR},
        {"B major", MusicalKey::B_MAJOR}, {"B minor", MusicalKey::B_MINOR},
    };
    auto it = m.find(s);
    return it != m.end() ? it->second : MusicalKey::C_MINOR;
}

struct GenerateRequest {
    Genre genre = Genre::HIPHOP;
    int bpm = 120;
    Mood mood = Mood::CHILL;
    MusicalKey key = MusicalKey::C_MINOR;
    int duration = 120;
    std::vector<std::string> instruments;
    std::string custom_prompt;
    int seed = -1; // -1 = no seed
    bool force_instrumental = true;
};
