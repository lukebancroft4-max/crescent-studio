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
    <footer className="border-t border-border-subtle bg-surface/90 glass shrink-0" role="region" aria-label="Playback controls">
      {/* Progress bar */}
      <div className="h-[2px] bg-border-subtle">
        <div
          className="h-full bg-gradient-to-r from-gold-dim via-gold to-gold-bright transition-all duration-100"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="px-5 py-3 flex items-center gap-4">
        {/* Transport buttons */}
        <div className="flex items-center gap-2">
          {/* Play/Pause */}
          <button
            onClick={() => (isPlaying ? pause() : play())}
            disabled={!isLoaded}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
            style={{
              background: isPlaying
                ? "rgba(139,92,246,0.15)"
                : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              boxShadow: isPlaying ? "none" : "0 4px 16px rgba(139,92,246,0.3)",
            }}
          >
            {isPlaying ? (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" className="text-gold">
                <rect x="1" y="1" width="4" height="12" rx="1" />
                <rect x="9" y="1" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" className="text-white ml-0.5">
                <path d="M2 1.5L12 7L2 12.5V1.5Z" />
              </svg>
            )}
          </button>

          {/* Stop */}
          <button
            onClick={stop}
            disabled={!isLoaded}
            aria-label="Stop"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-cream-muted hover:text-cream hover:bg-surface-raised transition-all duration-200 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
              <rect x="1" y="1" width="10" height="10" rx="2" />
            </svg>
          </button>
        </div>

        {/* Time display */}
        <div className="flex items-baseline gap-1 font-mono">
          <span className="text-lg text-cream tabular-nums tracking-tight">
            {formatTime(currentTime)}
          </span>
          <span className="text-cream-muted/40 text-xs">/</span>
          <span className="text-cream-muted text-xs tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Loop toggle */}
        <button
          onClick={toggleLoop}
          aria-label={isLooping ? "Disable loop" : "Enable loop"}
          aria-pressed={isLooping}
          className={`px-2.5 py-1 rounded-md text-[9px] tracking-[0.14em] uppercase font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none ${
            isLooping
              ? "bg-gold/15 text-gold border border-gold/30 shadow-sm shadow-gold/10"
              : "text-cream-muted/50 border border-border-subtle hover:text-cream-muted hover:border-border"
          }`}
        >
          Loop
        </button>

        {/* Beat info — centered */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {currentBeat.params ? (
            <>
              <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.12em] uppercase bg-gold/10 text-gold-bright border border-gold/20 font-medium">
                {currentBeat.params.genre.replace("-", " ")}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.12em] uppercase bg-surface-raised text-cream-muted border border-border-subtle">
                {currentBeat.params.bpm} BPM
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.12em] uppercase bg-surface-raised text-cream-muted border border-border-subtle hidden sm:inline-flex">
                {currentBeat.params.key}
              </span>
            </>
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
    </footer>
  );
}

function MiniDownload({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1.5 rounded-lg text-[9px] tracking-[0.1em] uppercase text-cream-muted/60 border border-border-subtle hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
    >
      {label}
    </button>
  );
}
