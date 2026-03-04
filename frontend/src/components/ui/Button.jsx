/**
 * Button — reusable button component
 * Variants: primary, secondary, danger, ghost
 * Sizes: sm, md, lg
 */
const VARIANT_CLASSES = {
  primary:
    "bg-gold text-noir hover:bg-gold-bright active:opacity-90 shadow-sm",
  secondary:
    "border border-border bg-surface-raised/60 text-cream hover:bg-surface-raised hover:border-gold/40 active:opacity-80",
  danger:
    "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 active:opacity-80",
  ghost:
    "text-cream-muted hover:text-cream hover:bg-surface-raised/50 active:opacity-80",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1 text-[10px] tracking-[0.12em]",
  md: "px-4 py-2 text-xs tracking-[0.1em]",
  lg: "px-6 py-3 text-sm tracking-[0.08em]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-all duration-200 uppercase
        disabled:opacity-40 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary}
        ${SIZE_CLASSES[size] || SIZE_CLASSES.md}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="w-3 h-3 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {children}
    </button>
  );
}
