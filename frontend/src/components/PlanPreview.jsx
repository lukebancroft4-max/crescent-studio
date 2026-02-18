import { useState } from "react";

export default function PlanPreview({ plan, onGenerate, onDiscard }) {
  const [seed, setSeed] = useState("");

  const sections = plan?.composition_plan?.sections || plan?.sections || [];
  const globalStyles = plan?.composition_plan?.positive_global_styles || plan?.positive_global_styles || [];

  function handleGenerate() {
    const compositionPlan = plan?.composition_plan || plan;
    const seedValue = seed.trim() ? parseInt(seed, 10) : null;
    onGenerate(compositionPlan, seedValue);
  }

  return (
    <div className="animate-fade-up space-y-4">
      <div className="panel rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium">
            Composition Plan
          </p>
          <p className="text-[10px] tracking-[0.1em] text-gold-dim">
            FREE preview &mdash; no credits used
          </p>
        </div>

        {/* Global styles */}
        {globalStyles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {globalStyles.map((style, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full text-[10px] tracking-[0.04em] bg-gold/10 text-gold border border-gold/20"
              >
                {style}
              </span>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="space-y-2">
          {sections.map((section, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 bg-surface-raised/30 border border-border-subtle"
            >
              <span className="text-gold-dim text-[10px] font-bold w-5 text-center">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-cream text-xs font-medium capitalize">
                  {section.section_name || `Section ${i + 1}`}
                </p>
                {section.positive_local_styles && section.positive_local_styles.length > 0 && (
                  <p className="text-cream-muted text-[10px] mt-0.5">
                    {section.positive_local_styles.join(", ")}
                  </p>
                )}
              </div>
              <span className="text-cream-muted/50 text-[10px] tabular-nums">
                {section.duration_ms ? `${(section.duration_ms / 1000).toFixed(0)}s` : ""}
              </span>
            </div>
          ))}
        </div>

        {/* Seed input */}
        <div>
          <label className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium block mb-1.5">
            Seed (optional)
          </label>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Random"
            className="w-full bg-surface text-cream text-sm rounded-md px-4 py-2 border border-border-subtle focus:border-gold/40 transition-colors placeholder-cream-muted/40"
          />
          <p className="text-cream-muted/40 text-[10px] mt-1">
            Use same seed to reproduce similar results
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            className="flex-1 py-3 rounded-md text-sm tracking-[0.12em] uppercase font-medium bg-gold text-white hover:opacity-90 transition-opacity"
          >
            Compose from Plan
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-3 rounded-md text-sm tracking-[0.12em] uppercase text-cream-muted border border-border-subtle hover:border-border transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
