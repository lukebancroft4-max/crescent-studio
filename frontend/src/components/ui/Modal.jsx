import { useEffect } from "react";

/**
 * Modal — accessible dialog overlay
 */
export default function Modal({ isOpen, onClose, title, children, className = "" }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative panel rounded-xl p-6 w-full max-w-lg shadow-xl animate-fade-up ${className}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-cream tracking-wide">{title}</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-cream-muted/40 hover:text-cream hover:bg-surface-raised/50 transition-all"
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
