/**
 * Card — generic surface container with optional hover and click behavior
 */
export default function Card({
  children,
  className = "",
  hoverable = false,
  onClick,
  padding = "p-5",
}) {
  return (
    <div
      onClick={onClick}
      className={`
        panel rounded-lg
        ${padding}
        ${hoverable ? "cursor-pointer transition-all duration-200 hover:border-gold/30 hover:shadow-md" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
