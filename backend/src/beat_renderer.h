#pragma once

#define MINIMP3_IMPLEMENTATION
#include "../deps/minimp3.h"
#include "../deps/minimp3_ex.h"

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <map>
#include <stdexcept>
#include <string>
#include <vector>

#include "../deps/json.hpp"
#include "midi_writer.h"
#include "models.h"
#include "sample_library.h"
#include "utils.h"

namespace fs = std::filesystem;
using json = nlohmann::json;

namespace renderer {

// ============================================================
//  PCM sample representation
// ============================================================

struct PcmSample {
    std::vector<float> data;   // interleaved stereo
    int sample_rate = 44100;
    int channels    = 2;
    int num_frames  = 0;
};

// ============================================================
//  Decode MP3 to float PCM using minimp3
// ============================================================

inline PcmSample decode_mp3_to_pcm(const std::string& path) {
    mp3dec_t mp3d;
    mp3dec_file_info_t info;
    mp3dec_init(&mp3d);

    if (mp3dec_load(&mp3d, path.c_str(), &info, nullptr, nullptr)) {
        throw std::runtime_error("Failed to decode MP3: " + path);
    }

    PcmSample pcm;
    pcm.sample_rate = info.hz;
    pcm.channels = info.channels;
    pcm.num_frames = (int)info.samples / info.channels;

    // Convert int16 to float and ensure stereo
    if (info.channels == 1) {
        // Mono -> stereo
        pcm.channels = 2;
        pcm.data.resize(pcm.num_frames * 2);
        for (int i = 0; i < pcm.num_frames; ++i) {
            float s = info.buffer[i] / 32768.0f;
            pcm.data[i * 2]     = s;
            pcm.data[i * 2 + 1] = s;
        }
    } else {
        // Already stereo (or more, just take first 2 channels)
        pcm.data.resize(pcm.num_frames * 2);
        for (int i = 0; i < pcm.num_frames; ++i) {
            pcm.data[i * 2]     = info.buffer[i * info.channels]     / 32768.0f;
            pcm.data[i * 2 + 1] = info.buffer[i * info.channels + 1] / 32768.0f;
        }
    }

    free(info.buffer);
    return pcm;
}

// ============================================================
//  Sample Bank: loads all samples into memory
// ============================================================

class SampleBank {
public:
    bool loaded = false;

    bool load(const fs::path& output_dir) {
        auto manifest = samples::load_manifest(output_dir);
        auto dir = samples::library_dir(output_dir);

        bank_.clear();
        for (auto& s : samples::get_all_percussion_samples()) {
            if (!manifest.contains(s.name)) continue;
            auto file = dir / manifest[s.name].get<std::string>();
            if (!fs::exists(file)) continue;
            try {
                bank_[s.midi_note] = decode_mp3_to_pcm(file.string());
            } catch (...) {
                // Skip samples that fail to decode
            }
        }
        loaded = !bank_.empty();
        return loaded;
    }

    const PcmSample* get(uint8_t midi_note) const {
        auto it = bank_.find(midi_note);
        return it != bank_.end() ? &it->second : nullptr;
    }

    size_t size() const { return bank_.size(); }

private:
    std::map<uint8_t, PcmSample> bank_;
};

// ============================================================
//  WAV writer helpers
// ============================================================

namespace detail {

inline void write_le16(std::ofstream& f, uint16_t v) {
    f.put(v & 0xFF);
    f.put((v >> 8) & 0xFF);
}

inline void write_le32(std::ofstream& f, uint32_t v) {
    f.put(v & 0xFF);
    f.put((v >> 8) & 0xFF);
    f.put((v >> 16) & 0xFF);
    f.put((v >> 24) & 0xFF);
}

} // namespace detail

// ============================================================
//  Core beat renderer: MIDI patterns + samples -> WAV
// ============================================================

inline std::string render_beat(SampleBank& bank, const fs::path& output_dir,
                               Genre genre, int bpm, double duration_seconds) {
    if (!bank.loaded) {
        throw std::runtime_error("Sample bank not loaded");
    }

    const int sample_rate = 44100;
    const int channels = 2;

    // 1. Generate MIDI notes using the existing pattern system
    auto pattern_fn = midi::get_pattern_for_genre(genre);

    double beats_per_bar = 4.0;
    double seconds_per_bar = (beats_per_bar / bpm) * 60.0;
    int total_bars = std::max(1, (int)(duration_seconds / seconds_per_bar));

    std::vector<midi::Note> notes;
    for (int bar = 0; bar < total_bars; ++bar) {
        uint32_t bar_start = bar * midi::WHOLE;
        pattern_fn(notes, bar_start);
    }

    // 2. Allocate stereo float buffer
    int total_frames = (int)(sample_rate * duration_seconds) + sample_rate; // +1s padding
    std::vector<float> buffer(total_frames * channels, 0.0f);

    // 3. Mix each note into the buffer
    for (auto& note : notes) {
        const PcmSample* sample = bank.get(note.pitch);
        if (!sample) continue;

        // Convert tick to time: time = tick * 60.0 / (bpm * TPQ)
        double time = note.tick * 60.0 / (bpm * midi::TPQ);
        int frame_offset = (int)(time * sample_rate);

        if (frame_offset >= total_frames) continue;

        // Velocity scaling
        float amplitude = note.velocity / 127.0f;

        // Resample if needed (simple nearest-neighbor for different sample rates)
        double rate_ratio = (double)sample->sample_rate / sample_rate;

        int frames_to_mix = std::min(sample->num_frames, total_frames - frame_offset);
        if (rate_ratio != 1.0) {
            frames_to_mix = std::min((int)(sample->num_frames / rate_ratio),
                                     total_frames - frame_offset);
        }

        for (int i = 0; i < frames_to_mix; ++i) {
            int src_frame = (int)(i * rate_ratio);
            if (src_frame >= sample->num_frames) break;

            int dst_idx = (frame_offset + i) * channels;
            int src_idx = src_frame * 2; // samples are always stereo after decode

            buffer[dst_idx]     += sample->data[src_idx]     * amplitude;
            buffer[dst_idx + 1] += sample->data[src_idx + 1] * amplitude;
        }
    }

    // 4. Trim to actual duration (remove padding)
    int actual_frames = (int)(sample_rate * duration_seconds);
    actual_frames = std::min(actual_frames, total_frames);

    // 5. Peak normalize to prevent clipping
    float peak = 0.0f;
    for (int i = 0; i < actual_frames * channels; ++i) {
        peak = std::max(peak, std::abs(buffer[i]));
    }
    if (peak > 1.0f) {
        float gain = 0.95f / peak;
        for (int i = 0; i < actual_frames * channels; ++i) {
            buffer[i] *= gain;
        }
    }

    // 6. Write 16-bit PCM WAV
    std::string beat_id = "offline_" + random_hex_id(12);
    auto wav_path = output_dir / (beat_id + ".wav");

    std::ofstream f(wav_path.string(), std::ios::binary);
    if (!f) throw std::runtime_error("Cannot create WAV file");

    uint32_t data_size = actual_frames * channels * 2; // 16-bit = 2 bytes
    uint32_t file_size = 36 + data_size;

    // RIFF header
    f.write("RIFF", 4);
    detail::write_le32(f, file_size);
    f.write("WAVE", 4);

    // fmt chunk
    f.write("fmt ", 4);
    detail::write_le32(f, 16);               // chunk size
    detail::write_le16(f, 1);                // PCM format
    detail::write_le16(f, channels);         // channels
    detail::write_le32(f, sample_rate);      // sample rate
    detail::write_le32(f, sample_rate * channels * 2); // byte rate
    detail::write_le16(f, channels * 2);     // block align
    detail::write_le16(f, 16);               // bits per sample

    // data chunk
    f.write("data", 4);
    detail::write_le32(f, data_size);

    // Convert float to int16 and write
    for (int i = 0; i < actual_frames * channels; ++i) {
        float s = std::clamp(buffer[i], -1.0f, 1.0f);
        int16_t sample16 = (int16_t)(s * 32767.0f);
        f.put(sample16 & 0xFF);
        f.put((sample16 >> 8) & 0xFF);
    }

    return beat_id;
}

} // namespace renderer
