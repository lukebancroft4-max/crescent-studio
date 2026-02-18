import { useSettingsStore } from "../stores/settingsStore";
import { useState, useEffect } from "react";

const GENRES = [
  "afrobeats", "amapiano", "afro-fusion", "afro-pop", "highlife", "afro-house",
  "hip-hop", "rnb", "dancehall", "reggaeton", "trap", "lo-fi",
];

const MOODS = ["energetic", "chill", "dark", "uplifting", "romantic", "aggressive"];

const KEYS = [
  "C major", "C minor", "C# major", "C# minor", "D major", "D minor",
  "Eb major", "Eb minor", "E major", "E minor", "F major", "F minor",
  "F# major", "F# minor", "G major", "G minor", "Ab major", "Ab minor",
  "A major", "A minor", "Bb major", "Bb minor", "B major", "B minor",
];

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.ok ? r.json() : null)
      .catch(() => null)
      .then(setApiStatus);
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-8 h-full overflow-y-auto">
      <div>
        <h2 className="font-display text-xl text-cream tracking-wide">Settings</h2>
        <p className="text-cream-muted text-xs tracking-[0.1em] mt-1">
          Configure your default preferences
        </p>
      </div>

      {/* API Status */}
      <Section title="API Status">
        <div className="panel rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${apiStatus?.api_key_configured ? "bg-gold" : "bg-danger"}`} />
            <span className="text-cream text-sm">
              ElevenLabs API {apiStatus?.api_key_configured ? "Connected" : apiStatus === null ? "Checking..." : "Not Configured"}
            </span>
          </div>
          {apiStatus?.version && (
            <p className="text-cream-muted/50 text-xs pl-[22px]">Version: {apiStatus.version}</p>
          )}
        </div>
      </Section>

      {/* Default Preferences */}
      <Section title="Default Preferences">
        <div className="panel rounded-lg p-5 space-y-5">
          {/* Genre */}
          <SettingRow label="Default Genre">
            <select
              value={settings.defaultGenre}
              onChange={(e) => settings.updateSetting("defaultGenre", e.target.value)}
              className="bg-surface text-cream text-sm rounded-md px-4 py-2 border border-border-subtle focus:border-gold/40 transition-colors appearance-none cursor-pointer w-full max-w-[240px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232D7A5F' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>{g.replace("-", " ")}</option>
              ))}
            </select>
          </SettingRow>

          {/* BPM */}
          <SettingRow label="Default BPM">
            <div className="flex items-center gap-3 w-full max-w-[240px]">
              <input
                type="range"
                min={60}
                max={200}
                value={settings.defaultBpm}
                onChange={(e) => settings.updateSetting("defaultBpm", Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-cream text-sm tabular-nums w-8 text-right">{settings.defaultBpm}</span>
            </div>
          </SettingRow>

          {/* Mood */}
          <SettingRow label="Default Mood">
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => settings.updateSetting("defaultMood", m)}
                  className={`px-3 py-1.5 rounded-full text-[11px] tracking-[0.06em] uppercase transition-all duration-300 ${
                    settings.defaultMood === m
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream-muted border border-border-subtle hover:text-cream hover:border-border"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </SettingRow>

          {/* Key */}
          <SettingRow label="Default Key">
            <select
              value={settings.defaultKey}
              onChange={(e) => settings.updateSetting("defaultKey", e.target.value)}
              className="bg-surface text-cream text-sm rounded-md px-4 py-2 border border-border-subtle focus:border-gold/40 transition-colors appearance-none cursor-pointer w-full max-w-[240px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232D7A5F' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </SettingRow>

          {/* Duration */}
          <SettingRow label="Default Duration">
            <div className="flex gap-1.5">
              {[30, 60, 120, 180].map((d) => (
                <button
                  key={d}
                  onClick={() => settings.updateSetting("defaultDuration", d)}
                  className={`px-4 py-1.5 rounded text-[11px] tracking-[0.06em] uppercase transition-all duration-300 ${
                    settings.defaultDuration === d
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream-muted border border-border-subtle hover:text-cream hover:border-border"
                  }`}
                >
                  {d >= 60 ? `${d / 60}:00` : `0:${d}`}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </Section>

      {/* Audio Output */}
      <Section title="Audio Output">
        <div className="panel rounded-lg p-5 space-y-5">
          <SettingRow label="Format">
            <div className="flex gap-1.5">
              {["mp3", "wav"].map((f) => (
                <button
                  key={f}
                  onClick={() => settings.updateSetting("outputFormat", f)}
                  className={`px-4 py-1.5 rounded text-[11px] tracking-[0.06em] uppercase transition-all duration-300 ${
                    settings.outputFormat === f
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream-muted border border-border-subtle hover:text-cream hover:border-border"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Quality">
            <div className="flex gap-1.5">
              {["128", "192", "320"].map((q) => (
                <button
                  key={q}
                  onClick={() => settings.updateSetting("outputQuality", q)}
                  className={`px-4 py-1.5 rounded text-[11px] tracking-[0.06em] uppercase transition-all duration-300 ${
                    settings.outputQuality === q
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream-muted border border-border-subtle hover:text-cream hover:border-border"
                  }`}
                >
                  {q}kbps
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="panel rounded-lg p-5">
          <div className="space-y-2">
            <p className="text-cream text-sm font-display tracking-wide">CRESCENT</p>
            <p className="text-cream-muted text-xs leading-relaxed">
              AI-powered beat generation studio built with ElevenLabs Music API,
              Tone.js multi-track audio engine, and real-time stem separation.
            </p>
            <div className="flex gap-4 pt-2 text-cream-muted/50 text-[10px] tracking-[0.1em] uppercase">
              <span>React 19</span>
              <span>Tone.js</span>
              <span>ElevenLabs v1</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium mb-3">{title}</p>
      {children}
    </div>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
      <span className="text-cream text-sm w-36 shrink-0">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}
