import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const FEATURES = [
  { icon: "🎵", label: "AI Beat Generation" },
  { icon: "🎚️", label: "Stem Separation" },
  { icon: "⚡", label: "Real-time Effects" },
  { icon: "🔌", label: "VST3 Plugins" },
];

/**
 * Hero — landing hero section shown in the home/studio page empty state
 */
export default function Hero({ onGetStarted }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up px-4">
      {/* Animated waveform decoration */}
      <div className="flex items-end gap-[3px] h-16 mb-10 opacity-25">
        {[20, 35, 55, 40, 60, 45, 30, 50, 35, 55, 25, 45, 60, 35, 20].map((h, i) => (
          <div
            key={i}
            className="w-[3px] bg-gold rounded-full"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* Headline */}
      <h2 className="font-display text-3xl md:text-4xl text-cream/90 tracking-wide font-light mb-3">
        AI-Powered Music Production Studio
      </h2>
      <p className="text-cream-muted text-sm max-w-md leading-relaxed mb-8">
        Generate professional beats from text prompts, separate stems, apply
        real-time effects, and process through VST3 plugins — all from one
        elegant interface.
      </p>

      {/* CTA buttons */}
      <div className="flex items-center gap-3 mb-12">
        <Button variant="primary" size="lg" onClick={onGetStarted}>
          Get Started
        </Button>
        <Button variant="ghost" size="lg" onClick={() => navigate("/library")}>
          View Library
        </Button>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {FEATURES.map(({ icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-subtle bg-surface/50 text-cream-muted text-[11px] tracking-wide"
          >
            <span>{icon}</span>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
