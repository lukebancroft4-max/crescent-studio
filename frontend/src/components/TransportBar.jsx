import { useState } from "react";

export default function TransportBar({
  wavesurfer,
  currentBeat,
  onDownloadAudio,
  onDownloadMidi,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function handlePlayPause() {
    if (!wavesurfer) return;
    wavesurfer.playPause();
    setIsPlaying(!isPlaying);
  }

  function handleStop() {
    if (!wavesurfer) return;
    wavesurfer.stop();
    setIsPlaying(false);
  }

  if (wavesurfer && !wavesurfer._transportBound) {
    wavesurfer.on("audioprocess", (time) => {
      setCurrentTime(time);
      setDuration(wavesurfer.getDuration());
    });
    wavesurfer.on("finish", () => {
      if (isLooping) {
        wavesurfer.play(0);
      } else {
        setIsPlaying(false);
      }
    });
    wavesurfer.on("seeking", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });
    wavesurfer._transportBound = true;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="panel rounded-lg px-5 py-3.5 flex items-center gap-5 flex-wrap">
      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        disabled={!wavesurfer}
        className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 group"
        style={{
          background: isPlaying
            ? "linear-gradient(135deg, rgba(201,169,110,0.2), rgba(201,169,110,0.1))"
            : "linear-gradient(135deg, rgba(201,169,110,0.9), rgba(139,115,69,0.9))",
          boxShadow: isPlaying ? "none" : "0 0 20px rgba(201,169,110,0.2)",
        }}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-gold">
            <rect x="1" y="1" width="4" height="12" rx="1" />
            <rect x="9" y="1" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-noir ml-0.5">
            <path d="M2 1.5L12 7L2 12.5V1.5Z" />
          </svg>
        )}
      </button>

      {/* Stop */}
      <button
        onClick={handleStop}
        disabled={!wavesurfer}
        className="w-8 h-8 rounded flex items-center justify-center text-cream-muted hover:text-cream transition-colors disabled:opacity-30"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="1" y="1" width="10" height="10" rx="1" />
        </svg>
      </button>

      {/* Time */}
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-xl text-cream tabular-nums tracking-wide">
          {formatTime(currentTime)}
        </span>
        <span className="text-cream-muted/40 text-xs">/</span>
        <span className="text-cream-muted text-xs tabular-nums">
          {formatTime(duration)}
        </span>
      </div>

      {/* Loop */}
      <button
        onClick={() => setIsLooping(!isLooping)}
        className={`px-3 py-1 rounded text-[10px] tracking-[0.12em] uppercase transition-all duration-300 ${
          isLooping
            ? "bg-gold/15 text-gold border border-gold/30"
            : "text-cream-muted/50 border border-border-subtle hover:text-cream-muted hover:border-border"
        }`}
      >
        Loop
      </button>

      <div className="flex-1" />

      {/* Downloads */}
      {currentBeat && (
        <div className="flex gap-2">
          <DownloadButton onClick={onDownloadAudio} label="MP3" />
          <DownloadButton onClick={onDownloadMidi} label="MIDI" />
        </div>
      )}
    </div>
  );
}

function DownloadButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 px-4 py-2 rounded border border-border-subtle hover:border-gold/30 text-cream-muted hover:text-gold transition-all duration-300"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className="opacity-60 group-hover:opacity-100 transition-opacity">
        <path d="M6 1v8M3 6.5L6 9.5 9 6.5M1 11h10" />
      </svg>
      <span className="text-[10px] tracking-[0.1em] uppercase font-medium">{label}</span>
    </button>
  );
}
