/**
 * QuickStart — step-by-step visual guide for new users
 */
const STEPS = [
  {
    number: "01",
    title: "Configure",
    description: "Choose your genre, mood, key, BPM and instruments in the left panel.",
  },
  {
    number: "02",
    title: "Generate",
    description: "Click Generate — ElevenLabs AI composes a full beat in seconds.",
  },
  {
    number: "03",
    title: "Mix",
    description: "Adjust individual stem volumes, add effects, or load VST3 plugins.",
  },
  {
    number: "04",
    title: "Export",
    description: "Download stems individually or export the full mix as audio.",
  },
];

export default function QuickStart() {
  return (
    <div className="panel rounded-lg p-6">
      <p className="text-[10px] tracking-[0.18em] uppercase text-cream-muted/70 font-medium mb-5">
        Quick Start
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STEPS.map((step, i) => (
          <div key={step.number} className="relative flex flex-col gap-2">
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-4 left-full w-full h-px bg-border-subtle -translate-y-1/2 z-0" />
            )}
            <span className="font-display text-3xl text-gold/40 font-light leading-none">
              {step.number}
            </span>
            <h4 className="text-cream text-sm font-medium tracking-wide">{step.title}</h4>
            <p className="text-cream-muted text-[11px] leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
