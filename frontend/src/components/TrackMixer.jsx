import { useState } from "react";

const TRACK_COLORS = {
  drums: "#ef4444",
  bass: "#f59e0b",
  melody: "#3b82f6",
  pad: "#8b5cf6",
};

export default function TrackMixer({ instruments }) {
  const [tracks, setTracks] = useState(() =>
    (instruments || []).map((inst) => ({
      name: inst,
      muted: false,
      solo: false,
      volume: 80,
    }))
  );

  function toggleMute(index) {
    setTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, muted: !t.muted } : t))
    );
  }

  function toggleSolo(index) {
    setTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, solo: !t.solo } : t))
    );
  }

  function setVolume(index, value) {
    setTracks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, volume: value } : t))
    );
  }

  if (!instruments || instruments.length === 0) return null;

  return (
    <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
      <h2 className="text-lg font-bold text-white">Mixer</h2>
      {tracks.map((track, i) => (
        <div
          key={track.name}
          className="flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3"
        >
          {/* Color indicator */}
          <div
            className="w-2 h-8 rounded-full"
            style={{ backgroundColor: TRACK_COLORS[track.name] || "#6b7280" }}
          />

          {/* Track name */}
          <span className="text-white text-sm font-medium w-16 capitalize">
            {track.name}
          </span>

          {/* Mute */}
          <button
            onClick={() => toggleMute(i)}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              track.muted
                ? "bg-red-600 text-white"
                : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
            }`}
          >
            M
          </button>

          {/* Solo */}
          <button
            onClick={() => toggleSolo(i)}
            className={`px-2 py-0.5 rounded text-xs font-bold transition ${
              track.solo
                ? "bg-yellow-500 text-black"
                : "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
            }`}
          >
            S
          </button>

          {/* Volume slider */}
          <input
            type="range"
            min={0}
            max={100}
            value={track.volume}
            onChange={(e) => setVolume(i, Number(e.target.value))}
            className="flex-1 accent-purple-500"
          />

          <span className="text-zinc-500 text-xs w-8 text-right">
            {track.volume}%
          </span>
        </div>
      ))}
      <p className="text-zinc-600 text-xs">
        Note: Mixer is visual — MusicGen generates a single stereo mix. Stem separation requires additional models.
      </p>
    </div>
  );
}
