import { useState, useEffect } from "react";
import { fetchPresets } from "../api/client";

export default function ControlsPanel({ onGenerate, isLoading }) {
  const [presets, setPresets] = useState(null);
  const [genre, setGenre] = useState("hip-hop");
  const [bpm, setBpm] = useState(90);
  const [mood, setMood] = useState("dark");
  const [musicalKey, setMusicalKey] = useState("C minor");
  const [duration, setDuration] = useState(30);
  const [instruments, setInstruments] = useState(["drums", "bass"]);

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
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : [...prev, value]
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (instruments.length === 0) return;
    onGenerate({ genre, bpm, mood, key: musicalKey, duration, instruments });
  }

  if (!presets) return <div className="text-zinc-400 p-4">Loading presets...</div>;

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-bold text-white">Controls</h2>

      {/* Genre */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Genre</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 border border-zinc-700 focus:border-purple-500 focus:outline-none"
        >
          {presets.genres.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      {/* BPM */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">BPM: {bpm}</label>
        <input
          type="range"
          min={60}
          max={200}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
      </div>

      {/* Mood */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Mood</label>
        <div className="flex flex-wrap gap-2">
          {presets.moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                mood === m.value
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Key</label>
        <select
          value={musicalKey}
          onChange={(e) => setMusicalKey(e.target.value)}
          className="w-full bg-zinc-800 text-white rounded-lg px-3 py-2 border border-zinc-700 focus:border-purple-500 focus:outline-none"
        >
          {presets.keys.map((k) => (
            <option key={k.value} value={k.value}>{k.label}</option>
          ))}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Duration</label>
        <div className="flex gap-2">
          {presets.duration_options.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`px-4 py-1.5 rounded-lg text-sm transition ${
                duration === d
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      {/* Instruments */}
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Instruments</label>
        <div className="flex flex-wrap gap-2">
          {presets.instruments.map((inst) => (
            <button
              key={inst.value}
              type="button"
              onClick={() => toggleInstrument(inst.value)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                instruments.includes(inst.value)
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {inst.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        disabled={isLoading || instruments.length === 0}
        className="w-full py-3 rounded-xl font-bold text-white transition bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Generating..." : "Generate Beat"}
      </button>
    </form>
  );
}
