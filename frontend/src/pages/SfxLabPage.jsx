import { useState, useEffect, useRef } from "react";
import { generateSfx, getAudioUrl } from "../api/client";

export default function SfxLabPage() {
  const [text, setText] = useState("");
  const [duration, setDuration] = useState(2);
  const [loop, setLoop] = useState(false);
  const [influence, setInfluence] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

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
      setHistory((prev) => [{ ...res, description: text.trim(), duration, createdAt: new Date().toISOString() }, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Generator panel */}
      <div className="w-full lg:w-[400px] xl:w-[440px] shrink-0 border-r border-border-subtle overflow-y-auto p-6 lg:p-7 space-y-6">
        <div>
          <h2 className="font-display text-xl text-cream tracking-wide">SFX Generator</h2>
          <p className="text-cream-muted text-xs tracking-[0.1em] mt-1">
            Create sound effects with AI
          </p>
        </div>

        {/* Description */}
        <div>
          <SectionLabel>Describe Your Sound</SectionLabel>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deep bass hit, vinyl scratch, cymbal crash, rain ambience, sci-fi laser..."
            rows={4}
            maxLength={500}
            className="w-full bg-surface text-cream text-sm rounded-md px-4 py-3 border border-border-subtle focus:border-gold/40 transition-colors resize-y placeholder-cream-muted/40 leading-relaxed"
          />
        </div>

        {/* Duration */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <SectionLabel>Duration</SectionLabel>
            <span className="font-display text-lg text-cream tabular-nums">{duration}s</span>
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
          <div className="flex justify-between text-[10px] text-cream-muted/50 mt-1.5">
            <span>0.5s</span>
            <span>30s</span>
          </div>
        </div>

        {/* Prompt influence */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <SectionLabel>Prompt Influence</SectionLabel>
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
          className="group relative w-full py-3.5 rounded-md text-sm tracking-[0.12em] uppercase font-medium transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gold-dim via-gold to-gold-dim opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <span className="relative text-white font-semibold">
            {isLoading ? "Generating..." : "Generate SFX"}
          </span>
        </button>

        {/* Error */}
        {error && (
          <div className="panel-inset rounded-lg p-4">
            <p className="text-danger text-xs">{error}</p>
          </div>
        )}

        {/* Result preview */}
        {result && (
          <div className="panel rounded-lg p-4 space-y-3">
            <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
              Generated
            </p>
            <SfxPreview src={getAudioUrl(result.id)} />
            <div className="flex gap-1.5">
              <button
                onClick={() => window.open(getAudioUrl(result.id), "_blank")}
                className="flex-1 py-2 rounded text-[10px] tracking-[0.08em] uppercase text-cream-muted border border-border-subtle hover:text-gold hover:border-gold/30 transition-all"
              >
                Download
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SFX Library */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6">
          <h3 className="font-display text-lg text-cream tracking-wide">SFX Library</h3>
          <p className="text-cream-muted text-xs tracking-[0.1em] mt-1">
            {history.length} effect{history.length !== 1 ? "s" : ""} this session
          </p>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" className="text-cream-muted/20 mb-4">
              <path d="M24 4v40M12 12l12-8 12 8M12 36l12 8 12-8" />
              <circle cx="24" cy="24" r="8" />
            </svg>
            <p className="text-cream-muted text-sm">No effects generated yet</p>
            <p className="text-cream-muted/50 text-xs mt-1">Describe a sound and hit generate</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((sfx, i) => (
              <div key={sfx.id || i} className="panel rounded-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-gold-bright/40 via-gold/60 to-gold-dim/40" />
                <div className="p-4 space-y-3">
                  <p className="text-cream text-sm font-medium line-clamp-2">{sfx.description}</p>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] tracking-[0.06em] uppercase bg-gold/10 text-gold border border-gold/20">
                      {sfx.duration}s
                    </span>
                  </div>
                  <SfxPreview src={getAudioUrl(sfx.id)} />
                  <button
                    onClick={() => window.open(getAudioUrl(sfx.id), "_blank")}
                    className="w-full py-2 rounded text-[10px] tracking-[0.08em] uppercase text-cream-muted border border-border-subtle hover:text-gold hover:border-gold/30 transition-all"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SfxPreview({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => { setPlaying(false); setProgress(0); };
    const onTime = () => {
      if (el.duration) setProgress((el.currentTime / el.duration) * 100);
    };
    el.addEventListener("ended", onEnd);
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("timeupdate", onTime);
    };
  }, []);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={src} preload="none" />
      <button
        onClick={toggle}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-gold/10 text-gold shrink-0"
      >
        {playing ? (
          <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="2" width="3" height="10" rx="1" />
            <rect x="9" y="2" width="3" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.5L12 7L3 12.5V1.5Z" />
          </svg>
        )}
      </button>
      <div className="flex-1 h-1.5 bg-border-subtle rounded-full overflow-hidden">
        <div className="h-full bg-gold/60 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 mb-2.5 font-medium">
      {children}
    </p>
  );
}
