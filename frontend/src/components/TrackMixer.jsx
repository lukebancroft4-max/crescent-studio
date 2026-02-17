import { useState } from "react";

const TRACK_COLORS = {
  drums: "#C9A96E",
  bass: "#8B7345",
  melody: "#E4C98A",
  pad: "#A8A29E",
  "log drum": "#C9A96E",
  shakers: "#8B7345",
  congas: "#E4C98A",
  "talking drum": "#C9A96E",
  guitar: "#A8A29E",
  piano: "#E4C98A",
  rhodes: "#C9A96E",
  horns: "#8B7345",
  marimba: "#E4C98A",
  kalimba: "#C9A96E",
  organ: "#A8A29E",
  flute: "#8B7345",
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
    <div className="panel rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
          Channel Mixer
        </p>
        <p className="text-[10px] tracking-[0.1em] text-cream-muted/30">
          {tracks.length} tracks
        </p>
      </div>

      {tracks.map((track, i) => (
        <div
          key={track.name}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-raised/50"
        >
          {/* Color bar */}
          <div
            className="w-[3px] h-6 rounded-full opacity-60"
            style={{ backgroundColor: TRACK_COLORS[track.name] || "#A8A29E" }}
          />

          {/* Name */}
          <span className="text-cream text-xs font-medium w-20 capitalize tracking-[0.02em]">
            {track.name}
          </span>

          {/* Mute */}
          <button
            onClick={() => toggleMute(i)}
            className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold tracking-wider transition-all duration-300 ${
              track.muted
                ? "bg-danger/20 text-danger border border-danger/30"
                : "text-cream-muted/40 border border-border-subtle hover:text-cream-muted hover:border-border"
            }`}
          >
            M
          </button>

          {/* Solo */}
          <button
            onClick={() => toggleSolo(i)}
            className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold tracking-wider transition-all duration-300 ${
              track.solo
                ? "bg-gold/20 text-gold border border-gold/30"
                : "text-cream-muted/40 border border-border-subtle hover:text-cream-muted hover:border-border"
            }`}
          >
            S
          </button>

          {/* Volume */}
          <div className="flex-1 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              value={track.volume}
              onChange={(e) => setVolume(i, Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-cream-muted/40 text-[10px] w-7 text-right tabular-nums">
              {track.volume}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
