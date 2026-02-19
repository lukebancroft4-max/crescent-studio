/**
 * Slider — styled range input with label and value display
 */
export default function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  onChange,
  className = "",
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <span className="text-cream-muted/50 text-[9px] w-20 capitalize truncate">
          {label}
        </span>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span className="text-cream-muted/40 text-[9px] w-14 text-right tabular-nums">
        {typeof value === "number"
          ? value.toFixed(step < 1 ? 2 : 0)
          : value}
        {unit}
      </span>
    </div>
  );
}
