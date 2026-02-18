import { useAudioStore } from "../stores/audioStore";
import { getAudioUrl, getMidiUrl, getStemsZipUrl } from "../api/client";

export default function GlobalTransport() {
  const currentBeat = useAudioStore((s) => s.currentBeat);
  const stemData = useAudioStore((s) => s.stemData);
  const isLoaded = useAudioStore((s) => s.isLoaded);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const isLooping = useAudioStore((s) => s.isLooping);
  const play = useAudioStore((s) => s.play);
  const pause = useAudioStore((s) => s.pause);
  const stop = useAudioStore((s) => s.stop);
  const toggleLoop = useAudioStore((s) => s.toggleLoop);

  if (!currentBeat) return null;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="border-t border-border-subtle bg-surface">
      {/* Progress bar */}
      <div className="h-[2px] bg-border-subtle">
        <div
          className="h-full bg-gold transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-5 py-2.5 flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={() => (isPlaying ? pause() : play())}
          disabled={!isLoaded}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30"
          style={{
            background: isPlaying
              ? "rgba(45,122,95,0.12)"
              : "linear-gradient(135deg, rgba(45,122,95,0.9), rgba(30,90,67,0.9))",
          }}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" className="text-gold">
              <rect x="1" y="1" width="4" height="12" rx="1" />
              <rect x="9" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" className="text-white ml-0.5">
              <path d="M2 1.5L12 7L2 12.5V1.5Z" />
            </svg>
          )}
        </button>

        {/* Stop */}
        <button
          onClick={stop}
          disabled={!isLoaded}
          className="w-7 h-7 rounded flex items-center justify-center text-cream-muted hover:text-cream transition-colors disabled:opacity-30"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="10" height="10" rx="1" />
          </svg>
        </button>

        {/* Time */}
        <div className="flex items-baseline gap-1">
          <span className="font-display text-lg text-cream tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-cream-muted/40 text-[10px]">/</span>
          <span className="text-cream-muted text-[10px] tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Loop */}
        <button
          onClick={toggleLoop}
          className={`px-2.5 py-0.5 rounded text-[9px] tracking-[0.12em] uppercase transition-all duration-300 ${
            isLooping
              ? "bg-gold/15 text-gold border border-gold/30"
              : "text-cream-muted/50 border border-border-subtle hover:text-cream-muted"
          }`}
        >
          Loop
        </button>

        {/* Beat info */}
        <div className="flex-1 flex items-center justify-center">
          {currentBeat.params ? (
            <span className="text-cream-muted text-[10px] tracking-[0.1em] uppercase">
              {currentBeat.params.genre.replace("-", " ")} &middot; {currentBeat.params.bpm} BPM &middot; {currentBeat.params.key}
            </span>
          ) : (
            <span className="text-cream-muted text-[10px] tracking-[0.1em] uppercase">
              {currentBeat.id}
            </span>
          )}
        </div>

        {/* Downloads */}
        <div className="flex gap-1.5">
          <MiniDownload onClick={() => window.open(getAudioUrl(currentBeat.id), "_blank")} label="MP3" />
          <MiniDownload onClick={() => window.open(getMidiUrl(currentBeat.id), "_blank")} label="MIDI" />
          {stemData && (
            <MiniDownload onClick={() => window.open(getStemsZipUrl(currentBeat.id), "_blank")} label="Stems" />
          )}
        </div>
      </div>
    </div>
  );
}

function MiniDownload({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded text-[9px] tracking-[0.08em] uppercase text-cream-muted/60 border border-border-subtle hover:text-gold hover:border-gold/30 transition-all duration-300"
    >
      {label}
    </button>
  );
}
