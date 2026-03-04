/**
 * Toggle — accessible on/off switch
 */
export default function Toggle({ checked = false, onChange, label, disabled = false }) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`
          relative w-8 h-4 rounded-full transition-all duration-200 focus:outline-none
          ${checked ? "bg-gold" : "bg-border"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-noir transition-transform duration-200
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </button>
      {label && (
        <span className="text-cream-muted text-xs">{label}</span>
      )}
    </label>
  );
}
