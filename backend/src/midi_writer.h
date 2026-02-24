#pragma once
#include <algorithm>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <string>
#include <vector>
#include "models.h"

// Genre-aware MIDI drum pattern writer for Crescent Studio
namespace midi {

inline void write_be16(std::ofstream& f, uint16_t v) {
    f.put((v >> 8) & 0xFF);
    f.put(v & 0xFF);
}

inline void write_be32(std::ofstream& f, uint32_t v) {
    f.put((v >> 24) & 0xFF);
    f.put((v >> 16) & 0xFF);
    f.put((v >> 8) & 0xFF);
    f.put(v & 0xFF);
}

inline void write_var_len(std::vector<uint8_t>& buf, uint32_t v) {
    if (v < 0x80) {
        buf.push_back(v & 0x7F);
    } else if (v < 0x4000) {
        buf.push_back(0x80 | ((v >> 7) & 0x7F));
        buf.push_back(v & 0x7F);
    } else if (v < 0x200000) {
        buf.push_back(0x80 | ((v >> 14) & 0x7F));
        buf.push_back(0x80 | ((v >> 7) & 0x7F));
        buf.push_back(v & 0x7F);
    } else {
        buf.push_back(0x80 | ((v >> 21) & 0x7F));
        buf.push_back(0x80 | ((v >> 14) & 0x7F));
        buf.push_back(0x80 | ((v >> 7) & 0x7F));
        buf.push_back(v & 0x7F);
    }
}

// ============================================================
//  General MIDI Percussion Map (Channel 10)
// ============================================================

// Core kit
constexpr uint8_t KICK        = 36;
constexpr uint8_t SIDE_STICK  = 37;
constexpr uint8_t SNARE       = 38;
constexpr uint8_t CLAP        = 39;
constexpr uint8_t SNARE_ELEC  = 40;
constexpr uint8_t CLOSED_HH   = 42;
constexpr uint8_t PEDAL_HH    = 44;
constexpr uint8_t OPEN_HH     = 46;
constexpr uint8_t RIDE        = 51;
constexpr uint8_t RIDE_BELL   = 53;
constexpr uint8_t CRASH       = 49;

// Toms (mapped to dundun/djembe)
constexpr uint8_t LOW_TOM     = 41;  // dundun
constexpr uint8_t MID_TOM     = 47;  // djembe bass
constexpr uint8_t HI_TOM      = 48;  // djembe tone/slap

// Congas
constexpr uint8_t MUTE_CONGA  = 62;
constexpr uint8_t OPEN_CONGA  = 63;
constexpr uint8_t LOW_CONGA   = 64;

// Bongos (mapped to talking drum)
constexpr uint8_t HI_BONGO    = 60;  // talking drum high
constexpr uint8_t LO_BONGO    = 61;  // talking drum low

// Bells and metals
constexpr uint8_t COWBELL     = 56;
constexpr uint8_t HI_AGOGO    = 67;
constexpr uint8_t LO_AGOGO    = 68;
constexpr uint8_t HI_WOODBLK  = 76;  // gankogui high bell
constexpr uint8_t LO_WOODBLK  = 77;  // gankogui low bell

// Shakers and rattles
constexpr uint8_t TAMBOURINE  = 54;  // shekere
constexpr uint8_t CABASA      = 69;  // axatse
constexpr uint8_t MARACAS     = 70;  // shakers
constexpr uint8_t CLAVES      = 75;

// Timbales (mapped to sakara/bata)
constexpr uint8_t HI_TIMBALE  = 65;  // sakara high
constexpr uint8_t LO_TIMBALE  = 66;  // sakara low / bata

// ============================================================
//  Note and pattern helpers
// ============================================================

struct Note {
    uint32_t tick;
    uint8_t  pitch;
    uint8_t  velocity;
    uint32_t duration;
};

// Ticks per quarter note
constexpr int TPQ = 480;
// Common subdivisions
constexpr int WHOLE     = TPQ * 4;
constexpr int HALF      = TPQ * 2;
constexpr int QUARTER   = TPQ;
constexpr int EIGHTH    = TPQ / 2;
constexpr int SIXTEENTH = TPQ / 4;
constexpr int TRIPLET8  = TPQ / 3;  // triplet 8th (for 12/8 feel)

// Add a note at a specific 16th-note position within a bar
inline void add_at_16th(std::vector<Note>& notes, uint32_t bar_start,
                        int sixteenth_pos, uint8_t pitch, uint8_t vel,
                        uint32_t dur = SIXTEENTH) {
    notes.push_back({bar_start + (uint32_t)(sixteenth_pos * SIXTEENTH), pitch, vel, dur});
}

// Add a note at a specific triplet-8th position within a bar (for 12/8)
inline void add_at_trip8(std::vector<Note>& notes, uint32_t bar_start,
                         int trip_pos, uint8_t pitch, uint8_t vel,
                         uint32_t dur = TRIPLET8) {
    notes.push_back({bar_start + (uint32_t)(trip_pos * TRIPLET8), pitch, vel, dur});
}

// ============================================================
//  Genre-specific pattern generators
//  Each generates 1 bar of notes, called in a loop for duration
// ============================================================

// --- Default 4/4 rock (fallback for non-Afro genres) ---
inline void pattern_default(std::vector<Note>& notes, uint32_t bar) {
    for (int i = 0; i < 16; ++i) {
        add_at_16th(notes, bar, i, CLOSED_HH, 80);
        if (i % 4 == 0) add_at_16th(notes, bar, i, KICK, 100);
        if (i % 4 == 2) add_at_16th(notes, bar, i, SNARE, 100);
    }
}

// --- AFROBEATS: Syncopated Afro swing ---
inline void pattern_afrobeats(std::vector<Note>& notes, uint32_t bar) {
    // Kick: 1, and-of-2 (pos 7), and-of-3 (pos 10)
    add_at_16th(notes, bar, 0, KICK, 105);
    add_at_16th(notes, bar, 7, KICK, 90);
    add_at_16th(notes, bar, 10, KICK, 95);
    // Snare: 2 and 4 (pos 4, 12)
    add_at_16th(notes, bar, 4, SNARE, 100);
    add_at_16th(notes, bar, 12, SNARE, 100);
    // Closed HH on 8ths
    for (int i = 0; i < 16; i += 2)
        add_at_16th(notes, bar, i, CLOSED_HH, 75);
    // Open HH on upbeats
    add_at_16th(notes, bar, 3, OPEN_HH, 70);
    add_at_16th(notes, bar, 11, OPEN_HH, 70);
    // Shaker 16ths (soft)
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, MARACAS, 50 + (i % 2) * 10);
    // Open conga accents
    add_at_16th(notes, bar, 3, OPEN_CONGA, 80);
    add_at_16th(notes, bar, 7, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 11, OPEN_CONGA, 80);
    add_at_16th(notes, bar, 15, MUTE_CONGA, 65);
}

// --- AMAPIANO: Log drum bounce ---
inline void pattern_amapiano(std::vector<Note>& notes, uint32_t bar) {
    // Log drum (low tom): 1, 2, 3 (pos 0, 4, 8)
    add_at_16th(notes, bar, 0, LOW_TOM, 100);
    add_at_16th(notes, bar, 4, LOW_TOM, 85);
    add_at_16th(notes, bar, 8, LOW_TOM, 95);
    // Kick ghost: and-of-1 (pos 3), and-of-3 (pos 10)
    add_at_16th(notes, bar, 3, KICK, 70);
    add_at_16th(notes, bar, 10, KICK, 75);
    // Snare (rim click): 2, 4
    add_at_16th(notes, bar, 4, SIDE_STICK, 85);
    add_at_16th(notes, bar, 12, SIDE_STICK, 85);
    // Closed HH on 8ths
    for (int i = 0; i < 16; i += 2)
        add_at_16th(notes, bar, i, CLOSED_HH, 70);
    // Shaker 16ths
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, MARACAS, 45 + (i % 4 == 0 ? 15 : 0));
    // Open HH accent
    add_at_16th(notes, bar, 7, OPEN_HH, 65);
    add_at_16th(notes, bar, 15, OPEN_HH, 60);
}

// --- AFRO_FUSION: Modern + traditional blend ---
inline void pattern_afro_fusion(std::vector<Note>& notes, uint32_t bar) {
    // Kick: 1, ghost on e-of-2, and-of-3
    add_at_16th(notes, bar, 0, KICK, 100);
    add_at_16th(notes, bar, 5, KICK, 70);
    add_at_16th(notes, bar, 10, KICK, 90);
    // Snare: 2 and 4 with ghost on e-of-4
    add_at_16th(notes, bar, 4, SNARE, 95);
    add_at_16th(notes, bar, 12, SNARE, 95);
    add_at_16th(notes, bar, 13, SNARE, 50); // ghost
    // HH 16ths with accent pattern
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, CLOSED_HH, (i % 2 == 0) ? 80 : 55);
    // Shaker
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, MARACAS, 45);
    // Conga pattern
    add_at_16th(notes, bar, 3, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 6, MUTE_CONGA, 65);
    add_at_16th(notes, bar, 11, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 14, MUTE_CONGA, 65);
}

// --- HIGHLIFE: 6/8 bell pattern (3+3+2 expressed in triplet 8ths) ---
inline void pattern_highlife(std::vector<Note>& notes, uint32_t bar) {
    // Gankogui bell: classic 3+3+2 pattern in 12 pulses
    add_at_trip8(notes, bar, 0, HI_WOODBLK, 95);
    add_at_trip8(notes, bar, 3, LO_WOODBLK, 85);
    add_at_trip8(notes, bar, 5, HI_WOODBLK, 80);
    add_at_trip8(notes, bar, 8, LO_WOODBLK, 90);
    add_at_trip8(notes, bar, 10, HI_WOODBLK, 80);
    // Kick: on 1 and the "and" of the 6/8
    add_at_trip8(notes, bar, 0, KICK, 100);
    add_at_trip8(notes, bar, 6, KICK, 85);
    // Snare on 4 and 10 (cross-rhythm)
    add_at_trip8(notes, bar, 4, SNARE, 90);
    add_at_trip8(notes, bar, 10, SNARE, 85);
    // Shaker on every triplet pulse
    for (int i = 0; i < 12; ++i)
        add_at_trip8(notes, bar, i, MARACAS, 50 + (i % 3 == 0 ? 15 : 0));
    // Conga accents
    add_at_trip8(notes, bar, 2, OPEN_CONGA, 75);
    add_at_trip8(notes, bar, 5, MUTE_CONGA, 65);
    add_at_trip8(notes, bar, 8, OPEN_CONGA, 75);
    add_at_trip8(notes, bar, 11, MUTE_CONGA, 65);
}

// --- JUJU: Talking drum-led, agogo bell ---
inline void pattern_juju(std::vector<Note>& notes, uint32_t bar) {
    // Agogo bell pattern
    add_at_16th(notes, bar, 0, HI_AGOGO, 90);
    add_at_16th(notes, bar, 3, LO_AGOGO, 75);
    add_at_16th(notes, bar, 6, HI_AGOGO, 85);
    add_at_16th(notes, bar, 8, LO_AGOGO, 80);
    add_at_16th(notes, bar, 10, HI_AGOGO, 75);
    add_at_16th(notes, bar, 13, LO_AGOGO, 70);
    // Soft kick foundation
    add_at_16th(notes, bar, 0, KICK, 80);
    add_at_16th(notes, bar, 8, KICK, 75);
    // Talking drum lead (bongo mapped)
    add_at_16th(notes, bar, 2, HI_BONGO, 90);
    add_at_16th(notes, bar, 4, LO_BONGO, 85);
    add_at_16th(notes, bar, 7, HI_BONGO, 95);
    add_at_16th(notes, bar, 9, LO_BONGO, 80);
    add_at_16th(notes, bar, 11, HI_BONGO, 85);
    add_at_16th(notes, bar, 14, LO_BONGO, 90);
    // Shekere constant
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, TAMBOURINE, 50 + (i % 4 == 0 ? 15 : 0));
    // Light snare
    add_at_16th(notes, bar, 4, SIDE_STICK, 70);
    add_at_16th(notes, bar, 12, SIDE_STICK, 70);
}

// --- FUJI: Pure percussion, no kick/snare ---
inline void pattern_fuji(std::vector<Note>& notes, uint32_t bar) {
    // Dundun (low tom) on 1 and 3
    add_at_16th(notes, bar, 0, LOW_TOM, 100);
    add_at_16th(notes, bar, 8, LOW_TOM, 95);
    // Dundun ghost notes
    add_at_16th(notes, bar, 6, LOW_TOM, 65);
    add_at_16th(notes, bar, 14, LOW_TOM, 60);
    // Talking drum fills
    add_at_16th(notes, bar, 1, HI_BONGO, 85);
    add_at_16th(notes, bar, 3, LO_BONGO, 90);
    add_at_16th(notes, bar, 5, HI_BONGO, 80);
    add_at_16th(notes, bar, 7, LO_BONGO, 85);
    add_at_16th(notes, bar, 9, HI_BONGO, 90);
    add_at_16th(notes, bar, 11, LO_BONGO, 80);
    add_at_16th(notes, bar, 13, HI_BONGO, 85);
    add_at_16th(notes, bar, 15, LO_BONGO, 75);
    // Sakara drum (timbale mapped)
    add_at_16th(notes, bar, 0, HI_TIMBALE, 85);
    add_at_16th(notes, bar, 4, LO_TIMBALE, 80);
    add_at_16th(notes, bar, 8, HI_TIMBALE, 85);
    add_at_16th(notes, bar, 12, LO_TIMBALE, 80);
    // Shekere constant
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, TAMBOURINE, 55);
    // Conga accents
    add_at_16th(notes, bar, 2, OPEN_CONGA, 80);
    add_at_16th(notes, bar, 6, MUTE_CONGA, 70);
    add_at_16th(notes, bar, 10, OPEN_CONGA, 80);
    add_at_16th(notes, bar, 14, MUTE_CONGA, 70);
}

// --- AFROBEAT CLASSIC: Tony Allen polyrhythm ---
inline void pattern_afrobeat_classic(std::vector<Note>& notes, uint32_t bar) {
    // Tony Allen "broken" kick: 1, e-of-2, and-of-3, a-of-4
    add_at_16th(notes, bar, 0, KICK, 100);
    add_at_16th(notes, bar, 5, KICK, 80);
    add_at_16th(notes, bar, 10, KICK, 90);
    add_at_16th(notes, bar, 15, KICK, 75);
    // Snare: ghost on e-of-1, accent on 2, ghost on a-of-3, accent on 4
    add_at_16th(notes, bar, 1, SNARE, 45);  // ghost
    add_at_16th(notes, bar, 4, SNARE, 100);
    add_at_16th(notes, bar, 11, SNARE, 50); // ghost
    add_at_16th(notes, bar, 12, SNARE, 100);
    // Ride on every quarter
    add_at_16th(notes, bar, 0, RIDE, 90);
    add_at_16th(notes, bar, 4, RIDE, 85);
    add_at_16th(notes, bar, 8, RIDE, 90);
    add_at_16th(notes, bar, 12, RIDE, 85);
    // Shekere 16ths
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, TAMBOURINE, 45 + (i % 4 == 0 ? 15 : 0));
    // Clave pattern (3-2 son clave)
    add_at_16th(notes, bar, 0, CLAVES, 85);
    add_at_16th(notes, bar, 3, CLAVES, 80);
    add_at_16th(notes, bar, 6, CLAVES, 80);
    add_at_16th(notes, bar, 10, CLAVES, 85);
    add_at_16th(notes, bar, 12, CLAVES, 80);
    // Gankogui bell
    add_at_16th(notes, bar, 0, HI_WOODBLK, 80);
    add_at_16th(notes, bar, 4, LO_WOODBLK, 70);
    add_at_16th(notes, bar, 8, HI_WOODBLK, 80);
    add_at_16th(notes, bar, 12, LO_WOODBLK, 70);
}

// --- SOUKOUS: Fast rumba rhythm ---
inline void pattern_soukous(std::vector<Note>& notes, uint32_t bar) {
    // Kick: 1 and and-of-2, syncopated doubles
    add_at_16th(notes, bar, 0, KICK, 100);
    add_at_16th(notes, bar, 3, KICK, 75);
    add_at_16th(notes, bar, 6, KICK, 85);
    add_at_16th(notes, bar, 10, KICK, 80);
    // Driving snare on 2 and 4
    add_at_16th(notes, bar, 4, SNARE, 100);
    add_at_16th(notes, bar, 12, SNARE, 100);
    // Hi-hat 16ths
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, CLOSED_HH, (i % 2 == 0) ? 80 : 60);
    // Cowbell pattern
    add_at_16th(notes, bar, 0, COWBELL, 85);
    add_at_16th(notes, bar, 4, COWBELL, 80);
    add_at_16th(notes, bar, 8, COWBELL, 85);
    add_at_16th(notes, bar, 12, COWBELL, 80);
    // Conga rumba
    add_at_16th(notes, bar, 2, OPEN_CONGA, 80);
    add_at_16th(notes, bar, 5, MUTE_CONGA, 70);
    add_at_16th(notes, bar, 8, LOW_CONGA, 75);
    add_at_16th(notes, bar, 11, OPEN_CONGA, 80);
    add_at_16th(notes, bar, 14, MUTE_CONGA, 70);
    // Shaker
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, MARACAS, 45);
}

// --- MAKOSSA: Bass-drum interlock ---
inline void pattern_makossa(std::vector<Note>& notes, uint32_t bar) {
    // Syncopated kick interlock
    add_at_16th(notes, bar, 0, KICK, 100);
    add_at_16th(notes, bar, 3, KICK, 85);
    add_at_16th(notes, bar, 6, KICK, 80);
    add_at_16th(notes, bar, 8, KICK, 95);
    add_at_16th(notes, bar, 11, KICK, 80);
    add_at_16th(notes, bar, 14, KICK, 75);
    // Snare on 2 and 4
    add_at_16th(notes, bar, 4, SNARE, 95);
    add_at_16th(notes, bar, 12, SNARE, 95);
    // Offbeat hi-hat
    for (int i = 1; i < 16; i += 2)
        add_at_16th(notes, bar, i, CLOSED_HH, 75);
    // Cowbell accent
    add_at_16th(notes, bar, 0, COWBELL, 85);
    add_at_16th(notes, bar, 6, COWBELL, 80);
    add_at_16th(notes, bar, 10, COWBELL, 85);
    // Conga
    add_at_16th(notes, bar, 2, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 5, MUTE_CONGA, 65);
    add_at_16th(notes, bar, 10, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 13, MUTE_CONGA, 65);
}

// --- AFRO-HOUSE: Four-on-the-floor + Afro percussion ---
inline void pattern_afro_house(std::vector<Note>& notes, uint32_t bar) {
    // Four-on-the-floor kick
    for (int i = 0; i < 16; i += 4)
        add_at_16th(notes, bar, i, KICK, 100);
    // Clap on 2 and 4
    add_at_16th(notes, bar, 4, CLAP, 90);
    add_at_16th(notes, bar, 12, CLAP, 90);
    // Closed HH 16ths
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, CLOSED_HH, (i % 2 == 0) ? 75 : 55);
    // Open HH accents
    add_at_16th(notes, bar, 6, OPEN_HH, 70);
    add_at_16th(notes, bar, 14, OPEN_HH, 65);
    // Shaker 16ths
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, MARACAS, 50);
    // Conga on upbeats
    add_at_16th(notes, bar, 2, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 6, MUTE_CONGA, 65);
    add_at_16th(notes, bar, 10, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 14, MUTE_CONGA, 65);
    // Djembe accent (hi tom)
    add_at_16th(notes, bar, 3, HI_TOM, 70);
    add_at_16th(notes, bar, 11, HI_TOM, 70);
    // Cowbell
    add_at_16th(notes, bar, 0, COWBELL, 75);
    add_at_16th(notes, bar, 8, COWBELL, 75);
}

// --- GQOM: Dark broken beat ---
inline void pattern_gqom(std::vector<Note>& notes, uint32_t bar) {
    // Distorted kick on 1 (heavy)
    add_at_16th(notes, bar, 0, KICK, 127);
    // Sparse kick hits
    add_at_16th(notes, bar, 7, KICK, 90);
    add_at_16th(notes, bar, 14, KICK, 85);
    // Open hat on and-of-3
    add_at_16th(notes, bar, 10, OPEN_HH, 85);
    // Sparse snare ghost
    add_at_16th(notes, bar, 6, SNARE, 55);
    add_at_16th(notes, bar, 12, CLAP, 80);
    // Minimal closed HH
    add_at_16th(notes, bar, 2, CLOSED_HH, 65);
    add_at_16th(notes, bar, 4, CLOSED_HH, 70);
    add_at_16th(notes, bar, 8, CLOSED_HH, 65);
    // Shaker (sparse)
    add_at_16th(notes, bar, 0, MARACAS, 50);
    add_at_16th(notes, bar, 4, MARACAS, 45);
    add_at_16th(notes, bar, 8, MARACAS, 50);
    add_at_16th(notes, bar, 12, MARACAS, 45);
}

// --- KUDURO: Electronic + tribal ---
inline void pattern_kuduro(std::vector<Note>& notes, uint32_t bar) {
    // 808 kick on every beat
    for (int i = 0; i < 16; i += 4)
        add_at_16th(notes, bar, i, KICK, 105);
    // Extra kick hits
    add_at_16th(notes, bar, 6, KICK, 80);
    add_at_16th(notes, bar, 14, KICK, 80);
    // Clap on 2 and 4
    add_at_16th(notes, bar, 4, CLAP, 100);
    add_at_16th(notes, bar, 12, CLAP, 100);
    // Rapid hi-hat triplets (using 16ths as approximation)
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, CLOSED_HH, 65 + (i % 3 == 0 ? 20 : 0));
    // Open HH
    add_at_16th(notes, bar, 3, OPEN_HH, 75);
    add_at_16th(notes, bar, 11, OPEN_HH, 75);
    // Cowbell tribal accents
    add_at_16th(notes, bar, 2, COWBELL, 80);
    add_at_16th(notes, bar, 5, COWBELL, 70);
    add_at_16th(notes, bar, 10, COWBELL, 80);
    add_at_16th(notes, bar, 13, COWBELL, 70);
    // Agogo
    add_at_16th(notes, bar, 0, HI_AGOGO, 75);
    add_at_16th(notes, bar, 8, LO_AGOGO, 70);
}

// --- MBALAX: Sabar drum-driven (12/8 feel) ---
inline void pattern_mbalax(std::vector<Note>& notes, uint32_t bar) {
    // Sabar lead (hi tom for slap, mid tom for tone)
    add_at_trip8(notes, bar, 0, HI_TOM, 100);
    add_at_trip8(notes, bar, 2, MID_TOM, 85);
    add_at_trip8(notes, bar, 3, HI_TOM, 95);
    add_at_trip8(notes, bar, 5, MID_TOM, 80);
    add_at_trip8(notes, bar, 7, HI_TOM, 90);
    add_at_trip8(notes, bar, 8, MID_TOM, 85);
    add_at_trip8(notes, bar, 10, HI_TOM, 95);
    add_at_trip8(notes, bar, 11, MID_TOM, 80);
    // Tama/talking drum accents
    add_at_trip8(notes, bar, 1, HI_BONGO, 80);
    add_at_trip8(notes, bar, 4, LO_BONGO, 85);
    add_at_trip8(notes, bar, 6, HI_BONGO, 75);
    add_at_trip8(notes, bar, 9, LO_BONGO, 80);
    // Bell timeline
    add_at_trip8(notes, bar, 0, HI_WOODBLK, 85);
    add_at_trip8(notes, bar, 3, LO_WOODBLK, 75);
    add_at_trip8(notes, bar, 6, HI_WOODBLK, 85);
    add_at_trip8(notes, bar, 8, LO_WOODBLK, 75);
    add_at_trip8(notes, bar, 10, HI_WOODBLK, 80);
    // Bass kick
    add_at_trip8(notes, bar, 0, KICK, 90);
    add_at_trip8(notes, bar, 6, KICK, 80);
    // Shaker
    for (int i = 0; i < 12; ++i)
        add_at_trip8(notes, bar, i, MARACAS, 50);
}

// --- KWAITO: Slow house, wide spacing ---
inline void pattern_kwaito(std::vector<Note>& notes, uint32_t bar) {
    // Kick on 1 only
    add_at_16th(notes, bar, 0, KICK, 105);
    // Snare on 3
    add_at_16th(notes, bar, 8, SNARE, 90);
    // Light clap on 4
    add_at_16th(notes, bar, 12, CLAP, 70);
    // Sparse closed HH
    add_at_16th(notes, bar, 2, CLOSED_HH, 65);
    add_at_16th(notes, bar, 6, CLOSED_HH, 70);
    add_at_16th(notes, bar, 10, CLOSED_HH, 65);
    add_at_16th(notes, bar, 14, CLOSED_HH, 70);
    // Open HH
    add_at_16th(notes, bar, 4, OPEN_HH, 60);
    // Shaker (every other 16th)
    for (int i = 0; i < 16; i += 2)
        add_at_16th(notes, bar, i, MARACAS, 45);
    // Cowbell (sparse)
    add_at_16th(notes, bar, 0, COWBELL, 65);
    add_at_16th(notes, bar, 8, COWBELL, 60);
}

// --- NDOMBOLO: Fast Congolese dance ---
inline void pattern_ndombolo(std::vector<Note>& notes, uint32_t bar) {
    // Strong kick
    add_at_16th(notes, bar, 0, KICK, 100);
    add_at_16th(notes, bar, 6, KICK, 85);
    add_at_16th(notes, bar, 8, KICK, 95);
    add_at_16th(notes, bar, 14, KICK, 80);
    // Snare rolls with flams on 2 and 4
    add_at_16th(notes, bar, 3, SNARE, 60);  // flam grace
    add_at_16th(notes, bar, 4, SNARE, 105);
    add_at_16th(notes, bar, 11, SNARE, 60); // flam grace
    add_at_16th(notes, bar, 12, SNARE, 105);
    // Busy hi-hat
    for (int i = 0; i < 16; ++i)
        add_at_16th(notes, bar, i, CLOSED_HH, 70 + (i % 2 == 0 ? 10 : 0));
    // Open HH
    add_at_16th(notes, bar, 7, OPEN_HH, 70);
    add_at_16th(notes, bar, 15, OPEN_HH, 65);
    // Cowbell accent
    add_at_16th(notes, bar, 0, COWBELL, 80);
    add_at_16th(notes, bar, 4, COWBELL, 75);
    add_at_16th(notes, bar, 8, COWBELL, 80);
    add_at_16th(notes, bar, 12, COWBELL, 75);
    // Conga
    add_at_16th(notes, bar, 2, OPEN_CONGA, 75);
    add_at_16th(notes, bar, 10, OPEN_CONGA, 75);
}

// ============================================================
//  Pattern dispatcher
// ============================================================

typedef void (*PatternFunc)(std::vector<Note>&, uint32_t);

inline PatternFunc get_pattern_for_genre(Genre genre) {
    switch (genre) {
        case Genre::AFROBEATS:        return pattern_afrobeats;
        case Genre::AMAPIANO:         return pattern_amapiano;
        case Genre::AFRO_FUSION:      return pattern_afro_fusion;
        case Genre::HIGHLIFE:         return pattern_highlife;
        case Genre::JUJU:             return pattern_juju;
        case Genre::FUJI:             return pattern_fuji;
        case Genre::AFROBEAT_CLASSIC: return pattern_afrobeat_classic;
        case Genre::SOUKOUS:          return pattern_soukous;
        case Genre::MAKOSSA:          return pattern_makossa;
        case Genre::AFRO_HOUSE:       return pattern_afro_house;
        case Genre::GQOM:            return pattern_gqom;
        case Genre::KUDURO:           return pattern_kuduro;
        case Genre::MBALAX:           return pattern_mbalax;
        case Genre::KWAITO:           return pattern_kwaito;
        case Genre::NDOMBOLO:         return pattern_ndombolo;
        default:                      return pattern_default;
    }
}

// ============================================================
//  MIDI file writer (genre-aware)
// ============================================================

inline bool write_drum_midi(const std::string& path, int bpm, double duration_seconds,
                            Genre genre = Genre::HIPHOP) {
    auto pattern_fn = get_pattern_for_genre(genre);

    double beats_per_bar = 4.0;
    double seconds_per_bar = (beats_per_bar / bpm) * 60.0;
    int total_bars = std::max(1, (int)(duration_seconds / seconds_per_bar));

    std::vector<Note> notes;
    for (int bar = 0; bar < total_bars; ++bar) {
        uint32_t bar_start = bar * WHOLE;
        pattern_fn(notes, bar_start);
    }

    // Sort by tick
    std::sort(notes.begin(), notes.end(), [](const Note& a, const Note& b) {
        return a.tick < b.tick;
    });

    // Build track data
    std::vector<uint8_t> track;

    // Track name
    {
        const char* name = "Crescent Afro Percussion";
        write_var_len(track, 0);
        track.push_back(0xFF);
        track.push_back(0x03);
        int len = (int)strlen(name);
        write_var_len(track, len);
        for (int i = 0; i < len; ++i)
            track.push_back(name[i]);
    }

    // Tempo
    {
        uint32_t us_per_beat = 60000000 / bpm;
        write_var_len(track, 0);
        track.push_back(0xFF);
        track.push_back(0x51);
        track.push_back(0x03);
        track.push_back((us_per_beat >> 16) & 0xFF);
        track.push_back((us_per_beat >> 8) & 0xFF);
        track.push_back(us_per_beat & 0xFF);
    }

    // Note events (channel 9)
    struct Event {
        uint32_t tick;
        uint8_t  status;
        uint8_t  data1;
        uint8_t  data2;
    };
    std::vector<Event> events;
    for (auto& n : notes) {
        events.push_back({n.tick, 0x99, n.pitch, n.velocity});
        events.push_back({n.tick + n.duration, 0x89, n.pitch, 0});
    }
    std::sort(events.begin(), events.end(), [](const Event& a, const Event& b) {
        return a.tick < b.tick;
    });

    uint32_t prev_tick = 0;
    for (auto& e : events) {
        uint32_t delta = e.tick - prev_tick;
        prev_tick = e.tick;
        write_var_len(track, delta);
        track.push_back(e.status);
        track.push_back(e.data1);
        track.push_back(e.data2);
    }

    // End of track
    write_var_len(track, 0);
    track.push_back(0xFF);
    track.push_back(0x2F);
    track.push_back(0x00);

    // Write file
    std::ofstream f(path, std::ios::binary);
    if (!f) return false;

    f.write("MThd", 4);
    write_be32(f, 6);
    write_be16(f, 0);
    write_be16(f, 1);
    write_be16(f, TPQ);

    f.write("MTrk", 4);
    write_be32(f, (uint32_t)track.size());
    f.write(reinterpret_cast<const char*>(track.data()), track.size());

    return true;
}

} // namespace midi
