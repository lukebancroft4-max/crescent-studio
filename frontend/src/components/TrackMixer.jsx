import { useState, useEffect } from "react";
import { getStemUrl } from "../api/client";
import { useAudioStore } from "../stores/audioStore";
import { useEffectChainStore } from "../stores/effectChainStore";
import EffectRack from "./EffectRack";
import VstPluginRack from "./VstPluginRack";

const TRACK_COLORS = {
  drums: "#2D7A5F",
  bass: "#1E5A43",
  melody: "#3A9E7A",
  pad: "#6B6560",
  vocals: "#2D7A5F",
  guitar: "#6B6560",
  piano: "#3A9E7A",
  other: "#1E5A43",
  "log drum": "#2D7A5F",
  shakers: "#1E5A43",
  congas: "#3A9E7A",
  "talking drum": "#2D7A5F",
  rhodes: "#2D7A5F",
  horns: "#1E5A43",
  marimba: "#3A9E7A",
  kalimba: "#2D7A5F",
  organ: "#6B6560",
  flute: "#1E5A43",
  "chord progression": "#3A9E7A",
};

export default function TrackMixer({ instruments, stems, beatId }) {
  const storeSetVolume = useAudioStore((s) => s.setVolume);
  const storeSetMute = useAudioStore((s) => s.setMute);
  const storeSetSolo = useAudioStore((s) => s.setSolo);
  const isLoaded = useAudioStore((s) => s.isLoaded);
  const chains = useEffectChainStore((s) => s.chains);

  const isStemMode = !!(stems && isLoaded);

  const trackNames = isStemMode
    ? stems.map((s) => s.replace(/\.[^.]+$/, ""))
    : instruments || [];

  const [tracks, setTracks] = useState(() =>
    trackNames.map((name) => ({
      name,
      muted: false,
      solo: false,
      volume: 80,
    }))
  );

  const [expandedTrack, setExpandedTrack] = useState(null);
  const [activeTab, setActiveTab] = useState({});

  useEffect(() => {
    setTracks(
      trackNames.map((name) => ({
        name,
        muted: false,
        solo: false,
        volume: 80,
      }))
    );
    if (isStemMode) {
      trackNames.forEach((_, i) => storeSetVolume(i, 80));
    }
    setExpandedTrack(null);
    setActiveTab({});
  }, [stems, instruments]);

  function toggleMute(index) {
    setTracks((prev) => {
      const newMuted = !prev[index].muted;
      if (isStemMode) storeSetMute(index, newMuted);
      return prev.map((t, i) => (i === index ? { ...t, muted: newMuted } : t));
    });
  }

  function toggleSolo(index) {
    setTracks((prev) => {
      const newSolo = !prev[index].solo;
      if (isStemMode) storeSetSolo(index, newSolo);
      return prev.map((t, i) => (i === index ? { ...t, solo: newSolo } : t));
    });
  }

  function setVolume(index, value) {
    setTracks((prev) => {
      if (isStemMode) storeSetVolume(index, value);
      return prev.map((t, i) => (i === index ? { ...t, volume: value } : t));
    });
  }

  function toggleExpand(index) {
    setExpandedTrack(expandedTrack === index ? null : index);
  }

  function getTab(index) {
    return activeTab[index] || "effects";
  }

  if (trackNames.length === 0) return null;

  return (
    <div className="panel rounded-lg p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
          {isStemMode ? "Stem Mixer" : "Channel Mixer"}
        </p>
        <p className="text-[10px] tracking-[0.1em] text-cream-muted/30">
          {tracks.length} tracks
        </p>
      </div>

      {tracks.map((track, i) => {
        const fxCount = (chains[i] || []).length;
        const isExpanded = expandedTrack === i;

        return (
          <div key={track.name}>
            <div className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-raised/50">
              {/* Color bar */}
              <div
                className="w-[3px] h-6 rounded-full opacity-60"
                style={{ backgroundColor: TRACK_COLORS[track.name] || "#6B6560" }}
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

              {/* FX button (only in stem mode) */}
              {isStemMode && (
                <button
                  onClick={() => toggleExpand(i)}
                  className={`relative w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold tracking-wider transition-all duration-300 ${
                    isExpanded
                      ? "bg-gold/20 text-gold border border-gold/30"
                      : "text-cream-muted/40 border border-border-subtle hover:text-cream-muted hover:border-border"
                  }`}
                >
                  FX
                  {fxCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold text-noir text-[7px] flex items-center justify-center font-bold">
                      {fxCount}
                    </span>
                  )}
                </button>
              )}

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

              {/* Per-stem download */}
              {isStemMode && beatId && (
                <button
                  onClick={() => window.open(getStemUrl(beatId, stems[i]), "_blank")}
                  className="w-6 h-6 rounded flex items-center justify-center text-cream-muted/40 border border-border-subtle hover:text-cream-muted hover:border-border transition-all duration-300"
                  title={`Download ${track.name}`}
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M6 1v8M3 6.5L6 9.5 9 6.5M1 11h10" />
                  </svg>
                </button>
              )}
            </div>

            {/* Expanded FX panel */}
            {isStemMode && isExpanded && (
              <div className="ml-6 mr-3 mt-1 mb-2">
                {/* Tabs */}
                <div className="flex gap-1 mb-2">
                  <button
                    onClick={() => setActiveTab((t) => ({ ...t, [i]: "effects" }))}
                    className={`px-2.5 py-1 rounded text-[9px] font-medium tracking-wider transition-all ${
                      getTab(i) === "effects"
                        ? "bg-gold/15 text-gold"
                        : "text-cream-muted/40 hover:text-cream-muted"
                    }`}
                  >
                    EFFECTS
                  </button>
                  <button
                    onClick={() => setActiveTab((t) => ({ ...t, [i]: "vst3" }))}
                    className={`px-2.5 py-1 rounded text-[9px] font-medium tracking-wider transition-all ${
                      getTab(i) === "vst3"
                        ? "bg-gold/15 text-gold"
                        : "text-cream-muted/40 hover:text-cream-muted"
                    }`}
                  >
                    VST3
                  </button>
                </div>

                {getTab(i) === "effects" ? (
                  <EffectRack stemIndex={i} />
                ) : (
                  <VstPluginRack stemIndex={i} beatId={beatId} stems={stems} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
