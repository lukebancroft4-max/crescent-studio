import { useAudioStore } from "../../stores/audioStore";

/**
 * TransportControls — play / pause / stop transport bar
 */
export default function TransportControls() {
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const play = useAudioStore((s) => s.play);
  const pause = useAudioStore((s) => s.pause);
  const stop = useAudioStore((s) => s.stop);

  return (
    <div className="flex items-center gap-2">
      {/* Play / Pause */}
      <button
        onClick={isPlaying ? pause : play}
        className="w-8 h-8 rounded-md flex items-center justify-center border border-border-subtle hover:border-gold/40 hover:text-gold transition-all duration-200 text-cream-muted"
        title={isPlaying ? "Pause" : "Play"}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="1" width="4" height="10" rx="1" />
            <rect x="7" y="1" width="4" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 1l9 5-9 5V1z" />
          </svg>
        )}
      </button>

      {/* Stop */}
      <button
        onClick={stop}
        className="w-8 h-8 rounded-md flex items-center justify-center border border-border-subtle hover:border-gold/40 hover:text-gold transition-all duration-200 text-cream-muted"
        title="Stop"
        aria-label="Stop"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <rect x="1" y="1" width="8" height="8" rx="1" />
        </svg>
      </button>
    </div>
  );
}
