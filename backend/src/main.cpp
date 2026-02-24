#include "../deps/httplib.h"
#include "../deps/json.hpp"
#include "generator.h"
#include "models.h"
#include "presets.h"
#include "utils.h"
#include "midi_writer.h"

#include <filesystem>
#include <iostream>
#include <mutex>
#include <chrono>

using json = nlohmann::json;
namespace fs = std::filesystem;

static GeneratorConfig g_cfg;
static json g_history = json::array();
static std::mutex g_history_mutex;
static fs::path g_history_file;

// Plugin cache (VST3 filesystem scan only — no pedalboard dependency)
static json g_plugins = json::array();

// --- History persistence ---

static void load_history() {
    if (!fs::exists(g_history_file)) return;
    try {
        auto content = read_file(g_history_file.string());
        g_history = json::parse(content);
    } catch (...) {
        g_history = json::array();
    }
}

static void save_history() {
    try {
        write_file(g_history_file.string(), g_history.dump(2));
    } catch (...) {}
}

// --- Parse GenerateRequest from JSON ---

static GenerateRequest parse_gen_request(const json& j) {
    GenerateRequest req;
    if (j.contains("genre"))     req.genre = genre_from_str(j["genre"].get<std::string>());
    if (j.contains("bpm"))       req.bpm = j["bpm"].get<int>();
    if (j.contains("mood"))      req.mood = mood_from_str(j["mood"].get<std::string>());
    if (j.contains("key"))       req.key = key_from_str(j["key"].get<std::string>());
    if (j.contains("duration"))  req.duration = j["duration"].get<int>();
    if (j.contains("seed") && !j["seed"].is_null()) req.seed = j["seed"].get<int>();
    if (j.contains("custom_prompt")) req.custom_prompt = j["custom_prompt"].get<std::string>();
    if (j.contains("instruments")) {
        for (auto& i : j["instruments"])
            req.instruments.push_back(i.get<std::string>());
    }
    if (j.contains("force_instrumental")) req.force_instrumental = j["force_instrumental"].get<bool>();
    return req;
}

// --- ISO timestamp ---

static std::string utc_now_iso() {
    auto now = std::chrono::system_clock::now();
    auto t = std::chrono::system_clock::to_time_t(now);
    char buf[64];
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", gmtime(&t));
    return buf;
}

// --- Serve a file with correct MIME type ---

static void serve_file(const httplib::Request&, httplib::Response& res,
                        const std::string& path, const std::string& filename) {
    auto data = read_file_bytes(path);
    if (data.empty()) {
        res.status = 404;
        res.set_content(R"({"detail":"File not found"})", "application/json");
        return;
    }
    res.set_content(std::string(data.begin(), data.end()), mime_for(filename));
    res.set_header("Content-Disposition", "attachment; filename=\"" + filename + "\"");
}

// --- JSON error response ---

static void error_response(httplib::Response& res, int code, const std::string& detail) {
    res.status = code;
    json j = {{"detail", detail}};
    res.set_content(j.dump(), "application/json");
}

// --- VST3 filesystem scan (no pedalboard needed) ---

static json scan_vst3_plugins(const std::vector<std::string>& extra_dirs = {}) {
    std::vector<fs::path> search_dirs;
#ifdef __linux__
    auto home = fs::path(getenv("HOME") ? getenv("HOME") : "/root");
    search_dirs.push_back(home / ".vst3");
    search_dirs.push_back("/usr/lib/vst3");
    search_dirs.push_back("/usr/local/lib/vst3");
#elif __APPLE__
    search_dirs.push_back("/Library/Audio/Plug-Ins/VST3");
    auto home = fs::path(getenv("HOME") ? getenv("HOME") : "/root");
    search_dirs.push_back(home / "Library/Audio/Plug-Ins/VST3");
#elif _WIN32
    search_dirs.push_back("C:\\Program Files\\Common Files\\VST3");
#endif

    for (auto& d : extra_dirs)
        if (fs::exists(d)) search_dirs.push_back(d);

    json plugins = json::array();
    std::set<std::string> seen;

    for (auto& dir : search_dirs) {
        if (!fs::exists(dir)) continue;
        for (auto& entry : fs::recursive_directory_iterator(dir, fs::directory_options::skip_permission_denied)) {
            auto path = entry.path().string();
            if (!path.ends_with(".vst3")) continue;
            if (seen.count(path)) continue;
            seen.insert(path);

            plugins.push_back({
                {"path", path},
                {"name", entry.path().stem().string()},
                {"manufacturer", "Unknown"},
                {"category", ""},
                {"param_count", 0},
                {"parameters", json::object()},
            });
        }
    }
    return plugins;
}

// ============================================================
//  MAIN
// ============================================================

int main(int argc, char* argv[]) {
    int port = 8000;
    if (argc > 1) port = std::atoi(argv[1]);

    // Resolve paths
    fs::path base_dir = fs::path(__FILE__).parent_path().parent_path();  // backend-cpp/
    fs::path env_path = base_dir / ".env";
    if (!fs::exists(env_path)) {
        // Try parent (beat-generator/backend/.env)
        env_path = base_dir.parent_path() / "backend" / ".env";
    }

    auto env = load_env(env_path.string());
    g_cfg.api_key = env["ELEVENLABS_API_KEY"];
    g_cfg.output_dir = base_dir.parent_path() / "output";
    fs::create_directories(g_cfg.output_dir);

    g_history_file = g_cfg.output_dir / "history.json";
    load_history();

    generator_init();

    httplib::Server svr;

    // CORS
    svr.set_pre_routing_handler([](const httplib::Request& req, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type");
        if (req.method == "OPTIONS") {
            res.status = 204;
            return httplib::Server::HandlerResponse::Handled;
        }
        return httplib::Server::HandlerResponse::Unhandled;
    });

    // --- GET /api/status ---
    svr.Get("/api/status", [](const httplib::Request&, httplib::Response& res) {
        json j = {
            {"api_key_configured", !g_cfg.api_key.empty() && g_cfg.api_key.size() > 5},
            {"version", "2.0.0-cpp"},
            {"total_beats", g_history.size()},
        };
        res.set_content(j.dump(), "application/json");
    });

    // --- GET /api/presets ---
    svr.Get("/api/presets", [](const httplib::Request&, httplib::Response& res) {
        json genres = json::array();
        auto& bpm_defaults = genre_bpm_defaults();
        for (auto& [g, bpm] : bpm_defaults) {
            std::string val = genre_to_str(g);
            std::string label = val;
            // Title-case and replace hyphens
            for (auto& c : label) if (c == '-') c = ' ';
            if (!label.empty()) label[0] = toupper(label[0]);
            for (size_t i = 1; i < label.size(); ++i)
                if (label[i-1] == ' ') label[i] = toupper(label[i]);
            genres.push_back({{"value", val}, {"label", label}, {"default_bpm", bpm}});
        }

        json moods = json::array();
        for (auto m : {"dark","energetic","chill","melancholic","aggressive","dreamy"}) {
            std::string label = m;
            label[0] = toupper(label[0]);
            moods.push_back({{"value", m}, {"label", label}});
        }

        json keys = json::array();
        for (int i = 0; i < 24; ++i) {
            auto k = static_cast<MusicalKey>(i);
            keys.push_back({{"value", key_to_str(k)}, {"label", key_to_str(k)}});
        }

        json instruments = json::array();
        for (auto& inst : all_instruments()) {
            std::string label = inst;
            label[0] = toupper(label[0]);
            instruments.push_back({{"value", inst}, {"label", label}});
        }

        json j = {
            {"genres", genres}, {"moods", moods}, {"keys", keys},
            {"instruments", instruments}, {"duration_options", duration_options()},
        };
        res.set_content(j.dump(), "application/json");
    });

    // --- GET /api/history ---
    svr.Get("/api/history", [](const httplib::Request& req, httplib::Response& res) {
        int limit = 50, offset = 0;
        if (req.has_param("limit"))  limit  = std::stoi(req.get_param_value("limit"));
        if (req.has_param("offset")) offset = std::stoi(req.get_param_value("offset"));

        std::lock_guard lock(g_history_mutex);
        json subset = json::array();
        for (int i = offset; i < (int)g_history.size() && i < offset + limit; ++i)
            subset.push_back(g_history[i]);

        json j = {{"beats", subset}, {"total", g_history.size()}};
        res.set_content(j.dump(), "application/json");
    });

    // --- POST /api/generate ---
    svr.Post("/api/generate", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            auto gen_req = parse_gen_request(j);

            std::string beat_id = generate_beat(g_cfg, gen_req);

            // Generate MIDI
            auto midi_path = g_cfg.output_dir / (beat_id + ".mid");
            midi::write_drum_midi(midi_path.string(), gen_req.bpm, gen_req.duration, gen_req.genre);

            json response = {
                {"id", beat_id},
                {"audio_url", "/api/export/audio/" + beat_id},
                {"midi_url", "/api/export/midi/" + beat_id},
                {"stems_url", "/api/stems/" + beat_id},
                {"params", j},
            };

            {
                std::lock_guard lock(g_history_mutex);
                g_history.insert(g_history.begin(), json{
                    {"id", beat_id}, {"params", j}, {"created_at", utc_now_iso()},
                });
                if (g_history.size() > 50) g_history.erase(g_history.end() - 1);
                save_history();
            }

            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            error_response(res, 503, std::string("AI generation failed: ") + e.what());
        }
    });

    // --- GET /api/export/audio/:beat_id ---
    svr.Get(R"(/api/export/audio/(\w[\w-]*))", [](const httplib::Request& req, httplib::Response& res) {
        auto beat_id = req.matches[1].str();
        if (!valid_beat_id(beat_id)) { error_response(res, 400, "Invalid beat ID"); return; }

        auto mp3 = g_cfg.output_dir / (beat_id + ".mp3");
        if (fs::exists(mp3)) { serve_file(req, res, mp3.string(), beat_id + ".mp3"); return; }
        auto wav = g_cfg.output_dir / (beat_id + ".wav");
        if (fs::exists(wav)) { serve_file(req, res, wav.string(), beat_id + ".wav"); return; }
        error_response(res, 404, "Beat not found");
    });

    // --- GET /api/export/midi/:beat_id ---
    svr.Get(R"(/api/export/midi/(\w[\w-]*))", [](const httplib::Request& req, httplib::Response& res) {
        auto beat_id = req.matches[1].str();
        if (!valid_beat_id(beat_id)) { error_response(res, 400, "Invalid beat ID"); return; }

        auto path = g_cfg.output_dir / (beat_id + ".mid");
        if (!fs::exists(path)) { error_response(res, 404, "MIDI not found"); return; }
        serve_file(req, res, path.string(), beat_id + ".mid");
    });

    // --- POST /api/separate/:beat_id ---
    svr.Post(R"(/api/separate/(\w[\w-]*))", [](const httplib::Request& req, httplib::Response& res) {
        auto beat_id = req.matches[1].str();
        if (!valid_beat_id(beat_id)) { error_response(res, 400, "Invalid beat ID"); return; }

        auto mp3 = g_cfg.output_dir / (beat_id + ".mp3");
        if (!fs::exists(mp3)) { error_response(res, 404, "Beat not found"); return; }

        try {
            auto stems = separate_stems(g_cfg, beat_id);
            json j = {{"beat_id", beat_id}, {"stems", stems}};
            res.set_content(j.dump(), "application/json");
        } catch (const std::exception& e) {
            error_response(res, 503, std::string("Stem separation failed: ") + e.what());
        }
    });

    // --- GET /api/stems/:beat_id ---
    svr.Get(R"(/api/stems/(\w[\w-]*))", [](const httplib::Request& req, httplib::Response& res) {
        auto beat_id = req.matches[1].str();
        if (!valid_beat_id(beat_id)) { error_response(res, 400, "Invalid beat ID"); return; }

        auto manifest = g_cfg.output_dir / (beat_id + "_stems") / "stems.json";
        if (!fs::exists(manifest)) { error_response(res, 404, "Stems not available"); return; }

        auto content = read_file(manifest.string());
        auto j = json::parse(content);
        json out = {{"beat_id", beat_id}, {"stems", j["stems"]}};
        res.set_content(out.dump(), "application/json");
    });

    // --- GET /api/stems-zip/:beat_id ---
    svr.Get(R"(/api/stems-zip/(\w[\w-]*))", [](const httplib::Request& req, httplib::Response& res) {
        auto beat_id = req.matches[1].str();
        if (!valid_beat_id(beat_id)) { error_response(res, 400, "Invalid beat ID"); return; }

        auto zip_path = g_cfg.output_dir / (beat_id + "_stems.zip");
        if (!fs::exists(zip_path)) { error_response(res, 404, "Stems ZIP not found"); return; }
        serve_file(req, res, zip_path.string(), beat_id + "_stems.zip");
    });

    // --- GET /api/stems/:beat_id/:stem_name ---
    svr.Get(R"(/api/stems/(\w[\w-]*)/(.+))", [](const httplib::Request& req, httplib::Response& res) {
        auto beat_id = req.matches[1].str();
        auto stem_name = req.matches[2].str();
        if (!valid_beat_id(beat_id)) { error_response(res, 400, "Invalid beat ID"); return; }
        if (!valid_stem_name(stem_name)) { error_response(res, 400, "Invalid stem name"); return; }

        auto path = g_cfg.output_dir / (beat_id + "_stems") / stem_name;
        if (!fs::exists(path)) { error_response(res, 404, "Stem not found"); return; }
        serve_file(req, res, path.string(), stem_name);
    });

    // --- POST /api/plan ---
    svr.Post("/api/plan", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            auto gen_req = parse_gen_request(j);
            auto plan = create_composition_plan(g_cfg, gen_req);
            res.set_content(plan, "application/json");
        } catch (const std::exception& e) {
            error_response(res, 503, std::string("Plan generation failed: ") + e.what());
        }
    });

    // --- POST /api/generate-from-plan ---
    svr.Post("/api/generate-from-plan", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            int seed = j.contains("seed") && !j["seed"].is_null() ? j["seed"].get<int>() : -1;
            auto plan_json = j["composition_plan"].dump();

            auto beat_id = generate_from_plan(g_cfg, plan_json, seed);

            // Generate MIDI
            auto midi_path = g_cfg.output_dir / (beat_id + ".mid");
            int plan_bpm = 120;
            Genre plan_genre = Genre::AFROBEATS;
            if (j.contains("bpm")) plan_bpm = j["bpm"].get<int>();
            if (j.contains("genre")) plan_genre = genre_from_str(j["genre"].get<std::string>());
            midi::write_drum_midi(midi_path.string(), plan_bpm, 120, plan_genre);

            json response = {
                {"id", beat_id},
                {"audio_url", "/api/export/audio/" + beat_id},
                {"midi_url", "/api/export/midi/" + beat_id},
                {"stems_url", "/api/stems/" + beat_id},
            };

            {
                std::lock_guard lock(g_history_mutex);
                g_history.insert(g_history.begin(), json{
                    {"id", beat_id}, {"params", nullptr}, {"created_at", utc_now_iso()},
                });
                if (g_history.size() > 50) g_history.erase(g_history.end() - 1);
                save_history();
            }

            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            error_response(res, 503, std::string("Generation failed: ") + e.what());
        }
    });

    // --- POST /api/sfx ---
    svr.Post("/api/sfx", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto j = json::parse(req.body);
            auto text = j["text"].get<std::string>();
            double duration = j.value("duration", 2.0);
            bool loop = j.value("loop", false);
            double pi = j.value("prompt_influence", 0.5);

            auto sfx_id = generate_sound_effect(g_cfg, text, duration, loop, pi);
            json response = {{"id", sfx_id}, {"audio_url", "/api/export/audio/" + sfx_id}};
            res.set_content(response.dump(), "application/json");
        } catch (const std::exception& e) {
            error_response(res, 503, std::string("SFX generation failed: ") + e.what());
        }
    });

    // --- POST /api/plugins/scan ---
    svr.Post("/api/plugins/scan", [](const httplib::Request& req, httplib::Response& res) {
        std::vector<std::string> extra;
        if (!req.body.empty()) {
            try {
                auto j = json::parse(req.body);
                if (j.contains("extra_dirs"))
                    for (auto& d : j["extra_dirs"])
                        extra.push_back(d.get<std::string>());
            } catch (...) {}
        }
        g_plugins = scan_vst3_plugins(extra);
        json j = {{"plugins", g_plugins}, {"count", g_plugins.size()}};
        res.set_content(j.dump(), "application/json");
    });

    // --- GET /api/plugins/list ---
    svr.Get("/api/plugins/list", [](const httplib::Request&, httplib::Response& res) {
        json j = {{"plugins", g_plugins}, {"count", g_plugins.size()}};
        res.set_content(j.dump(), "application/json");
    });

    // --- POST /api/plugins/process (stub — VST3 hosting needs JUCE/pedalboard) ---
    svr.Post("/api/plugins/process", [](const httplib::Request&, httplib::Response& res) {
        error_response(res, 501,
            "VST3 audio processing requires JUCE integration. "
            "Plugin scanning works; processing is not yet implemented in the C++ backend.");
    });

    std::cout << "Crescent Studio C++ backend v2.0.0" << std::endl;
    std::cout << "API key: " << (g_cfg.api_key.empty() ? "NOT SET" : "configured") << std::endl;
    std::cout << "Output: " << g_cfg.output_dir.string() << std::endl;
    std::cout << "History: " << g_history.size() << " beats" << std::endl;
    std::cout << "Listening on http://0.0.0.0:" << port << std::endl;

    svr.listen("0.0.0.0", port);

    generator_cleanup();
    return 0;
}
