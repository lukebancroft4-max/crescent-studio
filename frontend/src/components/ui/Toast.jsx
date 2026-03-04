import { useState, useEffect, useCallback } from "react";
import { _setEmitter } from "./toastEmitter";

const TOAST_DURATION = 4000;

/**
 * Place <ToastContainer /> once at the root of your app.
 * Import { toast } from "./toastEmitter" to show toasts imperatively.
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, TOAST_DURATION);
  }, []);

  useEffect(() => {
    _setEmitter(addToast);
    return () => { _setEmitter(null); };
  }, [addToast]);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
        <circle cx="8" cy="8" r="7" />
        <path d="M5 8l2 2 4-4" />
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
        <circle cx="8" cy="8" r="7" />
        <path d="M8 5v4M8 11v.5" />
      </svg>
    ),
    warning: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
        <path d="M8 2L1 14h14L8 2z" />
        <path d="M8 6v4M8 11v.5" />
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round">
        <circle cx="8" cy="8" r="7" />
        <path d="M8 7v5M8 5v.5" />
      </svg>
    ),
  };

  const borders = {
    success: "border-success/30",
    error: "border-danger/30",
    warning: "border-accent/30",
    info: "border-secondary/30",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80 pointer-events-none" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-fade-up panel rounded-xl px-4 py-3 flex items-start gap-3 border ${borders[t.type] || "border-border-subtle"}`}
          role="alert"
        >
          <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
          <p className="flex-1 text-cream text-sm leading-snug">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 text-cream-muted/50 hover:text-cream-muted transition-colors mt-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
