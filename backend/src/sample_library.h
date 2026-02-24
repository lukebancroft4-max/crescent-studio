#pragma once
#include <cstdint>
#include <filesystem>
#include <string>
#include <vector>
#include "../deps/json.hpp"
#include "utils.h"

namespace fs = std::filesystem;
using json = nlohmann::json;

namespace samples {

struct PercussionSample {
    uint8_t     midi_note;
    std::string name;
    std::string prompt;
    double      duration;  // seconds
};

inline const std::vector<PercussionSample>& get_all_percussion_samples() {
    static const std::vector<PercussionSample> lib = {
        {36, "kick",               "Deep punchy kick drum hit, dry, single hit",                     0.8},
        {37, "side_stick",         "Snare drum rim click, dry, single hit",                          0.5},
        {38, "snare",              "Crisp snare drum hit, dry, single hit",                          0.7},
        {39, "clap",               "Hand clap percussion hit, dry, single hit",                      0.6},
        {41, "dundun",             "Deep African dundun bass drum hit, warm, single hit",             1.0},
        {42, "closed_hh",          "Closed hi-hat cymbal hit, tight, single hit",                    0.5},
        {46, "open_hh",            "Open hi-hat cymbal hit, sustain, single hit",                    1.0},
        {47, "djembe_bass",        "Djembe bass tone, deep resonant, single hit",                    0.8},
        {48, "djembe_slap",        "Djembe slap tone, sharp bright, single hit",                     0.6},
        {51, "ride",               "Ride cymbal hit, clean, single hit",                             1.2},
        {54, "shekere",            "Shekere gourd shaker shake, single hit",                         0.6},
        {56, "cowbell",            "Cowbell hit, metallic, single hit",                              0.5},
        {60, "talking_drum_high",  "Talking drum high pitch hit, Nigerian, single hit",              0.7},
        {61, "talking_drum_low",   "Talking drum low pitch hit, Nigerian, single hit",               0.8},
        {62, "mute_conga",         "Muted conga drum hit, dry, single hit",                          0.5},
        {63, "open_conga",         "Open conga drum hit, resonant, single hit",                      0.8},
        {64, "low_conga",          "Low conga drum hit, deep, single hit",                           0.8},
        {65, "sakara_high",        "Sakara drum high tone, Yoruba clay frame drum, single hit",      0.6},
        {66, "sakara_low",         "Sakara drum low tone, Yoruba clay frame drum, single hit",       0.7},
        {67, "agogo_high",         "Agogo bell high pitch, metallic, single hit",                    0.5},
        {68, "agogo_low",          "Agogo bell low pitch, metallic, single hit",                     0.5},
        {70, "shakers",            "Egg shaker single shake, dry",                                   0.5},
        {75, "claves",             "Clave stick hit, wooden, dry, single hit",                       0.5},
        {76, "gankogui_high",      "Gankogui double bell high pitch, metallic, single hit",          0.5},
        {77, "gankogui_low",       "Gankogui double bell low pitch, metallic, single hit",           0.5},
    };
    return lib;
}

// Path to the sample library directory
inline fs::path library_dir(const fs::path& output_dir) {
    return output_dir / "sample_library";
}

// Path to the manifest file
inline fs::path manifest_path(const fs::path& output_dir) {
    return library_dir(output_dir) / "manifest.json";
}

// Load or create manifest
inline json load_manifest(const fs::path& output_dir) {
    auto path = manifest_path(output_dir);
    if (fs::exists(path)) {
        try {
            return json::parse(read_file(path.string()));
        } catch (...) {}
    }
    return json::object();
}

// Save manifest
inline void save_manifest(const fs::path& output_dir, const json& manifest) {
    auto dir = library_dir(output_dir);
    fs::create_directories(dir);
    write_file(manifest_path(output_dir).string(), manifest.dump(2));
}

// Check if a specific sample exists in the library
inline bool sample_exists(const fs::path& output_dir, const std::string& name) {
    auto manifest = load_manifest(output_dir);
    if (!manifest.contains(name)) return false;
    auto file = library_dir(output_dir) / manifest[name].get<std::string>();
    return fs::exists(file);
}

// Check if entire library is complete
inline bool is_library_complete(const fs::path& output_dir) {
    auto manifest = load_manifest(output_dir);
    auto dir = library_dir(output_dir);
    for (auto& s : get_all_percussion_samples()) {
        if (!manifest.contains(s.name)) return false;
        if (!fs::exists(dir / manifest[s.name].get<std::string>())) return false;
    }
    return true;
}

// Get list of missing sample names
inline std::vector<std::string> get_missing_samples(const fs::path& output_dir) {
    auto manifest = load_manifest(output_dir);
    auto dir = library_dir(output_dir);
    std::vector<std::string> missing;
    for (auto& s : get_all_percussion_samples()) {
        if (!manifest.contains(s.name) ||
            !fs::exists(dir / manifest[s.name].get<std::string>())) {
            missing.push_back(s.name);
        }
    }
    return missing;
}

// Get count of available samples
inline int count_available(const fs::path& output_dir) {
    return (int)get_all_percussion_samples().size() - (int)get_missing_samples(output_dir).size();
}

} // namespace samples
