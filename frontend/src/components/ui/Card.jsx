/**
 * Card component with variants and hover effects.
 *
 * @param {"default"|"elevated"|"inset"} [variant="default"]
 * @param {boolean} [hoverable=false]
 */
export default function Card({
  variant = "default",
  hoverable = false,
  children,
  className = "",
  ...props
}) {
  const base = "rounded-xl transition-all duration-200";

  const variants = {
    default: "panel",
    elevated:
      "bg-surface-raised border border-border shadow-xl shadow-black/30",
    inset: "panel-inset",
  };

  const hoverClass = hoverable
    ? "hover:border-gold/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gold/10 cursor-pointer"
    : "";

  return (
    <div
      className={`${base} ${variants[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
