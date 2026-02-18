import { useState, useRef } from "react";
import { generateSfx, getAudioUrl } from "../api/client";

export default function SfxPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [duration, setDuration] = useState(2);
  const [loop, setLoop] = useState(false);
  const [influence, setInfluence] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  async function handleGenerate() {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await generateSfx({
        text: text.trim(),
        duration,
        loop,
        prompt_influence: influence,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border-t border-border-subtle">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 lg:px-7 py-4 flex items-center justify-between text-left"
      >
        <span className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
          Sound Effects
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`text-cream-muted/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5L5 6.5L8 3.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-6 lg:px-7 pb-6 space-y-4">
          {/* Text input */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe a sound... e.g. deep bass hit, vinyl scratch, cymbal crash"
            rows={2}
            maxLength={500}
            className="w-full bg-surface text-cream text-sm rounded-md px-4 py-3 border border-border-subtle focus:border-gold/40 transition-colors resize-none placeholder-cream-muted/40 leading-relaxed"
          />

          {/* Duration */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
                Duration
              </span>
              <span className="text-cream text-xs tabular-nums">{duration}s</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={30}
              step={0.5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Prompt influence */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
                Prompt Influence
              </span>
              <span className="text-cream text-xs tabular-nums">{(influence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={influence}
              onChange={(e) => setInfluence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Loop toggle */}
          <button
            onClick={() => setLoop(!loop)}
            className={`px-3 py-1.5 rounded text-[10px] tracking-[0.12em] uppercase transition-all duration-300 ${
              loop
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-cream-muted/50 border border-border-subtle hover:text-cream-muted hover:border-border"
            }`}
          >
            Seamless Loop
          </button>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !text.trim()}
            className="w-full py-2.5 rounded-md text-[11px] tracking-[0.12em] uppercase font-medium bg-gold/80 text-white hover:bg-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Generate SFX"}
          </button>

          {/* Error */}
          {error && (
            <p className="text-danger text-[10px]">{error}</p>
          )}

          {/* Result preview */}
          {result && (
            <div className="flex items-center gap-3 bg-surface-raised/30 rounded-md px-3 py-2.5 border border-border-subtle">
              <audio
                ref={audioRef}
                src={getAudioUrl(result.id)}
                controls
                className="flex-1 h-8"
                style={{ filter: "sepia(30%) hue-rotate(120deg)" }}
              />
              <button
                onClick={() => window.open(getAudioUrl(result.id), "_blank")}
                className="w-6 h-6 rounded flex items-center justify-center text-cream-muted/40 border border-border-subtle hover:text-cream-muted hover:border-border transition-all duration-300"
                title="Download"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M6 1v8M3 6.5L6 9.5 9 6.5M1 11h10" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
