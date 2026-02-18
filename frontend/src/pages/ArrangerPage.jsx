import { useState, useRef, useEffect, useCallback } from "react";
import { useArrangerStore } from "../stores/arrangerStore";
import { useAudioStore } from "../stores/audioStore";
import { fetchHistory, getAudioUrl, getStemUrl } from "../api/client";

export default function ArrangerPage() {
  const tracks = useArrangerStore((s) => s.tracks);
  const timelineDuration = useArrangerStore((s) => s.timelineDuration);
  const pixelsPerSecond = useArrangerStore((s) => s.pixelsPerSecond);
  const playheadPosition = useArrangerStore((s) => s.playheadPosition);
  const isPlaying = useArrangerStore((s) => s.isPlaying);
  const addTrack = useArrangerStore((s) => s.addTrack);
  const setZoom = useArrangerStore((s) => s.setZoom);
  const playArrangement = useArrangerStore((s) => s.playArrangement);
  const stopArrangement = useArrangerStore((s) => s.stopArrangement);
  const addRegion = useArrangerStore((s) => s.addRegion);
  const moveRegion = useArrangerStore((s) => s.moveRegion);
  const removeRegion = useArrangerStore((s) => s.removeRegion);

  return (
    <div className="flex h-full">
      {/* Source Panel */}
      <SourcePanel />

      {/* Timeline area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b border-border-subtle px-4 py-2.5 flex items-center gap-4 bg-surface/50 shrink-0">
          <button
            onClick={isPlaying ? stopArrangement : playArrangement}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isPlaying
                ? "rgba(45,122,95,0.12)"
                : "linear-gradient(135deg, rgba(45,122,95,0.9), rgba(30,90,67,0.9))",
            }}
          >
            {isPlaying ? (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" className="text-gold">
                <rect x="1" y="1" width="10" height="10" rx="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor" className="text-white ml-0.5">
                <path d="M2 1.5L12 7L2 12.5V1.5Z" />
              </svg>
            )}
          </button>

          <button
            onClick={addTrack}
            className="px-3 py-1.5 rounded text-[10px] tracking-[0.08em] uppercase text-cream-muted border border-border-subtle hover:text-gold hover:border-gold/30 transition-all"
          >
            + Track
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-cream-muted/50 text-[10px] tracking-[0.1em] uppercase">Zoom</span>
            <input
              type="range"
              min={10}
              max={200}
              value={pixelsPerSecond}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-cream-muted text-[10px] tabular-nums w-8">{pixelsPerSecond}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-auto relative">
          <Timeline
            tracks={tracks}
            timelineDuration={timelineDuration}
            pixelsPerSecond={pixelsPerSecond}
            playheadPosition={playheadPosition}
            isPlaying={isPlaying}
            onAddRegion={addRegion}
            onMoveRegion={moveRegion}
            onRemoveRegion={removeRegion}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Source Panel ─── */
function SourcePanel() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentBeat = useAudioStore((s) => s.currentBeat);
  const stemData = useAudioStore((s) => s.stemData);

  useEffect(() => {
    fetchHistory()
      .then((data) => {
        const beats = data.beats || data || [];
        setSources(beats.map((b) => ({
          id: `beat-${b.id}`,
          name: b.params?.genre?.replace("-", " ") || b.id,
          audioUrl: getAudioUrl(b.id),
          duration: b.params?.duration || 120,
          type: "beat",
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stemSources = stemData
    ? stemData.stems.map((s) => ({
        id: `stem-${stemData.beat_id}-${s}`,
        name: s.replace(/\.[^.]+$/, ""),
        audioUrl: getStemUrl(stemData.beat_id, s),
        duration: 120,
        type: "stem",
      }))
    : [];

  const allSources = [...stemSources, ...sources];

  function handleDragStart(e, source) {
    e.dataTransfer.setData("application/json", JSON.stringify(source));
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div className="w-[220px] xl:w-[260px] shrink-0 border-r border-border-subtle overflow-y-auto bg-surface/30">
      <div className="p-4 border-b border-border-subtle">
        <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
          Sources
        </p>
      </div>

      {stemSources.length > 0 && (
        <div className="p-3 border-b border-border-subtle">
          <p className="text-[9px] tracking-[0.12em] uppercase text-gold-dim mb-2">Current Stems</p>
          {stemSources.map((src) => (
            <SourceItem key={src.id} source={src} onDragStart={handleDragStart} />
          ))}
        </div>
      )}

      <div className="p-3">
        <p className="text-[9px] tracking-[0.12em] uppercase text-cream-muted/50 mb-2">
          {loading ? "Loading..." : `${sources.length} Beats`}
        </p>
        {sources.map((src) => (
          <SourceItem key={src.id} source={src} onDragStart={handleDragStart} />
        ))}
        {!loading && sources.length === 0 && (
          <p className="text-cream-muted/40 text-[10px] py-4 text-center">
            Generate beats in Studio first
          </p>
        )}
      </div>
    </div>
  );
}

function SourceItem({ source, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, source)}
      className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-surface-raised/50 cursor-grab active:cursor-grabbing transition-colors mb-1"
    >
      <div className={`w-2 h-2 rounded-full ${source.type === "stem" ? "bg-gold" : "bg-gold-dim"}`} />
      <span className="text-cream text-xs capitalize truncate flex-1">{source.name}</span>
      <span className="text-cream-muted/40 text-[9px] tabular-nums">{source.duration}s</span>
    </div>
  );
}

/* ─── Timeline ─── */
function Timeline({ tracks, timelineDuration, pixelsPerSecond, playheadPosition, isPlaying, onAddRegion, onMoveRegion, onRemoveRegion }) {
  const timelineRef = useRef(null);
  const totalWidth = timelineDuration * pixelsPerSecond;

  function handleDrop(e, trackId) {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const source = JSON.parse(data);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + (timelineRef.current?.scrollLeft || 0);
    const startTime = Math.max(0, x / pixelsPerSecond);

    onAddRegion(trackId, {
      id: `region-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sourceId: source.id,
      name: source.name,
      audioUrl: source.audioUrl,
      startTime,
      duration: source.duration,
      trimStart: 0,
      trimEnd: 0,
    });
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  return (
    <div ref={timelineRef} className="overflow-auto h-full" style={{ minWidth: totalWidth + 200 }}>
      {/* Ruler */}
      <div className="sticky top-0 z-10 border-b border-border-subtle bg-surface h-7 flex" style={{ width: totalWidth }}>
        {Array.from({ length: Math.ceil(timelineDuration / 5) }, (_, i) => {
          const sec = i * 5;
          return (
            <div
              key={sec}
              className="absolute top-0 h-full border-l border-border-subtle flex items-end pb-0.5 pl-1"
              style={{ left: sec * pixelsPerSecond }}
            >
              <span className="text-cream-muted/40 text-[8px] tabular-nums">
                {Math.floor(sec / 60)}:{(sec % 60).toString().padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Track lanes */}
      {tracks.map((track) => (
        <div
          key={track.id}
          className="relative border-b border-border-subtle"
          style={{ width: totalWidth, height: 72 }}
          onDrop={(e) => handleDrop(e, track.id)}
          onDragOver={handleDragOver}
        >
          {/* Track label */}
          <div className="sticky left-0 z-[5] absolute top-0 h-full w-24 bg-surface/80 border-r border-border-subtle flex items-center px-3">
            <span className="text-cream text-[10px] font-medium truncate">{track.name}</span>
          </div>

          {/* Regions */}
          {track.regions.map((region) => (
            <RegionBlock
              key={region.id}
              region={region}
              pixelsPerSecond={pixelsPerSecond}
              onRemove={() => onRemoveRegion(region.id)}
            />
          ))}
        </div>
      ))}

      {/* Playhead */}
      {isPlaying && (
        <div
          className="absolute top-0 bottom-0 w-px bg-gold z-20 pointer-events-none"
          style={{ left: playheadPosition * pixelsPerSecond }}
        >
          <div className="w-2.5 h-2.5 bg-gold rounded-full -translate-x-1/2 -translate-y-0.5" />
        </div>
      )}

      {/* Empty state overlay */}
      {tracks.every((t) => t.regions.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: 28 }}>
          <div className="text-center">
            <p className="text-cream-muted/30 text-sm">Drag sources onto tracks</p>
            <p className="text-cream-muted/20 text-xs mt-1">Drop audio from the source panel to arrange</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Region Block ─── */
function RegionBlock({ region, pixelsPerSecond, onRemove }) {
  const effectiveDuration = region.duration - (region.trimStart || 0) - (region.trimEnd || 0);
  const width = effectiveDuration * pixelsPerSecond;
  const left = region.startTime * pixelsPerSecond;

  return (
    <div
      className="absolute top-2 group rounded overflow-hidden cursor-default"
      style={{
        left,
        width: Math.max(width, 20),
        height: 56,
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gold/15 border border-gold/30 rounded" />
      {/* Label */}
      <div className="relative px-2 py-1.5 h-full flex flex-col justify-between">
        <span className="text-gold text-[9px] font-medium capitalize truncate">{region.name}</span>
        <span className="text-gold/50 text-[8px] tabular-nums">{effectiveDuration.toFixed(1)}s</span>
      </div>
      {/* Delete */}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-noir/50 text-cream-muted/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-danger"
      >
        <svg width="6" height="6" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1l6 6M7 1l-6 6" />
        </svg>
      </button>
    </div>
  );
}
