import { useState, useEffect } from "react";
import { fetchPresets, createPlan } from "../api/client";

export default function ControlsPanel({ onGenerate, isLoading, onPlanCreated }) {
  const [presets, setPresets] = useState(null);
  const [genre, setGenre] = useState("afrobeats");
  const [bpm, setBpm] = useState(106);
  const [mood, setMood] = useState("energetic");
  const [musicalKey, setMusicalKey] = useState("A minor");
  const [duration, setDuration] = useState(120);
  const [instruments, setInstruments] = useState(["drums", "bass", "shakers", "congas"]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  useEffect(() => {
    fetchPresets().then(setPresets).catch(console.error);
  }, []);

  useEffect(() => {
    if (presets) {
      const match = presets.genres.find((g) => g.value === genre);
      if (match) setBpm(match.default_bpm);
    }
  }, [genre, presets]);

  function toggleInstrument(value) {
    setInstruments((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (instruments.length === 0 && !customPrompt.trim()) return;
    onGenerate({
      genre,
      bpm,
      mood,
      key: musicalKey,
      duration,
      instruments: instruments.length > 0 ? instruments : ["drums"],
      custom_prompt: customPrompt,
    });
  }

  if (!presets) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-4 h-4 rounded-full border border-gold/40 animate-spin-slow" />
      </div>
    );
  }

  const hasCustomPrompt = customPrompt.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="h-full overflow-y-auto p-6 lg:p-7 space-y-6">
      {/* Section: Prompt */}
      <div>
        <SectionLabel>Describe Your Beat</SectionLabel>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Nigerian Afrobeats gyration instrumental, heavy Afro swing drums, punchy kick, shakers, congas, talking drum accents, rolling bassline, instrumental only..."
          rows={4}
          maxLength={2000}
          className="w-full bg-surface text-cream text-sm rounded-md px-4 py-3 border border-border-subtle focus:border-gold/40 transition-colors resize-y placeholder-cream-muted/40 leading-relaxed"
        />
        {hasCustomPrompt && (
          <p className="text-gold-dim text-[10px] tracking-[0.12em] uppercase mt-2">
            Custom prompt active &mdash; presets below will be bypassed
          </p>
        )}
      </div>

      <Divider />

      {/* Section: Presets */}
      <div className={hasCustomPrompt ? "opacity-30 pointer-events-none transition-opacity" : "transition-opacity"}>
        {/* Genre */}
        <div className="space-y-5">
          <div>
            <SectionLabel>Genre</SectionLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {presets.genres.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGenre(g.value)}
                  className={`px-2 py-2 rounded text-[11px] tracking-[0.06em] uppercase transition-all duration-300 ${
                    genre === g.value
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream-muted border border-transparent hover:text-cream hover:bg-surface-raised"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* BPM */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <SectionLabel>Tempo</SectionLabel>
              <span className="font-display text-2xl text-cream tabular-nums">{bpm}</span>
            </div>
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-cream-muted/50 mt-1.5">
              <span>60</span>
              <span>BPM</span>
              <span>200</span>
            </div>
          </div>

          {/* Mood */}
          <div>
            <SectionLabel>Mood</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {presets.moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] tracking-[0.06em] uppercase transition-all duration-300 ${
                    mood === m.value
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream-muted border border-border-subtle hover:text-cream hover:border-border"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Key */}
          <div>
            <SectionLabel>Key</SectionLabel>
            <select
              value={musicalKey}
              onChange={(e) => setMusicalKey(e.target.value)}
              className="w-full bg-surface text-cream text-sm rounded-md px-4 py-2.5 border border-border-subtle focus:border-gold/40 transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232D7A5F' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              {presets.keys.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <SectionLabel>Duration</SectionLabel>
            <div className="flex gap-1.5">
              {presets.duration_options.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 py-2 rounded text-[11px] tracking-[0.06em] uppercase transition-all duration-300 ${
                    duration === d
                      ? "bg-gold/15 text-gold border border-gold/30"
                      : "text-cream-muted border border-border-subtle hover:text-cream hover:border-border"
                  }`}
                >
                  {d >= 60 ? `${d / 60}:00` : `0:${d}`}
                </button>
              ))}
            </div>
          </div>

          {/* Instruments */}
          <div>
            <SectionLabel>Instruments</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {presets.instruments.map((inst) => (
                <button
                  key={inst.value}
                  type="button"
                  onClick={() => toggleInstrument(inst.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] tracking-[0.04em] transition-all duration-300 ${
                    instruments.includes(inst.value)
                      ? "bg-cream/10 text-cream border border-cream/20"
                      : "text-cream-muted/60 border border-border-subtle hover:text-cream-muted hover:border-border"
                  }`}
                >
                  {inst.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Generate + Plan buttons */}
      <div className="space-y-2.5">
        <button
          type="submit"
          disabled={isLoading || isPlanLoading || (instruments.length === 0 && !hasCustomPrompt)}
          className="group relative w-full py-3.5 rounded-md text-sm tracking-[0.12em] uppercase font-medium transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gold-dim via-gold to-gold-dim opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative text-white font-semibold">
            {isLoading ? "Generating..." : "Generate"}
          </span>
        </button>

        <button
          type="button"
          disabled={isLoading || isPlanLoading || (instruments.length === 0 && !hasCustomPrompt)}
          onClick={async () => {
            setIsPlanLoading(true);
            try {
              const plan = await createPlan({
                genre,
                bpm,
                mood,
                key: musicalKey,
                duration,
                instruments: instruments.length > 0 ? instruments : ["drums"],
                custom_prompt: customPrompt,
              });
              if (onPlanCreated) onPlanCreated(plan);
            } catch (err) {
              console.error("Plan creation failed:", err);
            } finally {
              setIsPlanLoading(false);
            }
          }}
          className="w-full py-2.5 rounded-md text-[11px] tracking-[0.12em] uppercase font-medium text-cream-muted border border-border-subtle hover:border-gold/30 hover:text-gold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPlanLoading ? "Creating Plan..." : "Preview Plan (Free)"}
        </button>
      </div>
    </form>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 mb-2.5 font-medium">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-border-subtle" />;
}
