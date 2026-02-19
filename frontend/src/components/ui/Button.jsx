/**
 * Button component with variants, sizes, and states.
 *
 * @param {object} props
 * @param {"primary"|"secondary"|"outline"|"ghost"|"danger"} [props.variant="primary"]
 * @param {"sm"|"md"|"lg"|"xl"} [props.size="md"]
 * @param {boolean} [props.loading=false]
 * @param {React.ReactNode} [props.icon] - Leading icon element
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-gold text-white hover:bg-gold-bright active:scale-[0.98] shadow-lg shadow-gold/20",
    secondary:
      "bg-surface-raised text-cream hover:bg-surface-bright border border-border active:scale-[0.98]",
    outline:
      "bg-transparent text-gold border border-gold/50 hover:bg-gold/10 active:scale-[0.98]",
    ghost:
      "bg-transparent text-cream-muted hover:text-cream hover:bg-surface-raised active:scale-[0.98]",
    danger:
      "bg-danger text-white hover:bg-danger/90 active:scale-[0.98] shadow-lg shadow-danger/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
    xl: "px-6 py-3 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin-slow w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ) : icon ? (
        <span className="shrink-0 w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
