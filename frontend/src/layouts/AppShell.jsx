import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import GlobalTransport from "../components/GlobalTransport";
import StudioPage from "../pages/StudioPage";
import LibraryPage from "../pages/LibraryPage";
import ArrangerPage from "../pages/ArrangerPage";
import SfxLabPage from "../pages/SfxLabPage";
import SettingsPage from "../pages/SettingsPage";
import PluginsPage from "../pages/PluginsPage";

const NAV_ITEMS = [
  {
    path: "/",
    label: "Studio",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1" y="5" width="3" height="8" rx="1" />
        <rect x="5.5" y="3" width="3" height="12" rx="1" />
        <rect x="10" y="6" width="3" height="6" rx="1" />
        <rect x="14.5" y="4" width="3" height="10" rx="1" />
      </svg>
    ),
  },
  {
    path: "/library",
    label: "Library",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="1" y="1" width="7" height="7" rx="1.5" />
        <rect x="10" y="1" width="7" height="7" rx="1.5" />
        <rect x="1" y="10" width="7" height="7" rx="1.5" />
        <rect x="10" y="10" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: "/arranger",
    label: "Arranger",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <line x1="1" y1="4" x2="17" y2="4" />
        <line x1="1" y1="9" x2="17" y2="9" />
        <line x1="1" y1="14" x2="17" y2="14" />
        <rect x="3" y="2" width="6" height="4" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="7" y="7" width="8" height="4" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="2" y="12" width="5" height="4" rx="1" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    path: "/sfx",
    label: "SFX Lab",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M9 1v16M5 4l4-3 4 3M5 14l4 3 4-3" />
        <circle cx="9" cy="9" r="3" />
      </svg>
    ),
  },
  {
    path: "/plugins",
    label: "Plugins",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="2" y="6" width="14" height="10" rx="2" />
        <path d="M6 6V4a1 1 0 011-1h0a1 1 0 011 1v2M10 6V4a1 1 0 011-1h0a1 1 0 011 1v2" />
        <circle cx="6" cy="11" r="1.5" />
        <circle cx="12" cy="11" r="1.5" />
      </svg>
    ),
  },
  {
    path: "/settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <circle cx="9" cy="9" r="3" />
        <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.05 3.05l1.41 1.41M13.54 13.54l1.41 1.41M3.05 14.95l1.41-1.41M13.54 4.46l1.41-1.41" />
      </svg>
    ),
  },
];

const PAGE_TITLES = {
  "/": "Studio",
  "/library": "Library",
  "/arranger": "Arranger",
  "/sfx": "SFX Lab",
  "/plugins": "Plugins",
  "/settings": "Settings",
};

export default function AppShell() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || "Studio";

  return (
    <div className="min-h-screen bg-noir flex flex-col">
      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/[0.06] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border-subtle shrink-0 z-10">
        <div className="px-8 py-4 flex items-end justify-between">
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-2xl md:text-3xl font-light tracking-[0.08em] text-cream text-gold-glow">
              CRESCENT
            </h1>
            <p className="font-display text-sm tracking-[0.2em] text-gold-dim uppercase">
              {pageTitle}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-cream-muted text-xs tracking-[0.15em] uppercase">
            <span>AI Beat Engine</span>
            <span className="w-1 h-1 rounded-full bg-gold/60" />
            <span>ElevenLabs v1</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <nav className="w-16 md:w-[72px] shrink-0 border-r border-border-subtle flex flex-col items-center py-4 gap-1 bg-surface/50">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `w-12 h-12 md:w-14 md:h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-300 group ${
                  isActive
                    ? "bg-gold/10 text-gold"
                    : "text-cream-muted/40 hover:text-cream-muted hover:bg-surface-raised/50"
                }`
              }
            >
              {item.icon}
              <span className="text-[7px] md:text-[8px] tracking-[0.1em] uppercase font-medium">
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<StudioPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/arranger" element={<ArrangerPage />} />
            <Route path="/sfx" element={<SfxLabPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Transport */}
      <GlobalTransport />
    </div>
  );
}
