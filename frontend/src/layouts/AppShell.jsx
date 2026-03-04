import { useState } from "react";
import { Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
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
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
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
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
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
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
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
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M9 1v16M5 4l4-3 4 3M5 14l4 3 4-3" />
        <circle cx="9" cy="9" r="3" />
      </svg>
    ),
  },
  {
    path: "/plugins",
    label: "Plugins",
    icon: (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
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
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
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
  const navigate = useNavigate();
  const pageTitle = PAGE_TITLES[location.pathname] || "Studio";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-noir flex flex-col">
      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gold/[0.04] rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border-subtle shrink-0 z-10 glass">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back / Forward navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(-1)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-cream-muted/40 hover:text-cream hover:bg-surface-raised transition-all duration-200"
                title="Back"
                aria-label="Navigate back"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 2L4 7l5 5" />
                </svg>
              </button>
              <button
                onClick={() => navigate(1)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-cream-muted/40 hover:text-cream hover:bg-surface-raised transition-all duration-200"
                title="Forward"
                aria-label="Navigate forward"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 2l5 5-5 5" />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-lg shadow-gold/30">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C7 1 2 4 2 7.5a5 5 0 0010 0C12 4 7 1 7 1z" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <h1 className="font-display text-xl md:text-2xl font-light tracking-[0.1em] text-cream text-gold-glow">
                CRESCENT
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-border" />
              <p className="text-xs tracking-[0.18em] text-gold-bright/80 uppercase font-medium">
                {pageTitle}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-cream-muted text-xs tracking-[0.12em] uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              AI Beat Engine
            </span>
            <span className="w-px h-4 bg-border-subtle" />
            <span>ElevenLabs v1</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar nav */}
        <nav
          className={`shrink-0 border-r border-border-subtle flex flex-col items-center py-4 gap-1 bg-surface/80 transition-all duration-300 ${
            sidebarCollapsed ? "w-14" : "w-16 md:w-[72px]"
          }`}
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) =>
                `relative w-11 h-11 md:w-12 md:h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 group ${
                  isActive
                    ? "bg-gold/15 text-gold shadow-lg shadow-gold/10"
                    : "text-cream-muted/40 hover:text-cream-muted hover:bg-surface-raised/60"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-gold shadow-sm shadow-gold/50" />
                  )}
                  {item.icon}
                  {!sidebarCollapsed && (
                    <span className="text-[7px] md:text-[8px] tracking-[0.1em] uppercase font-medium">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {/* Collapse toggle at bottom */}
          <div className="mt-auto">
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="w-11 h-8 rounded-lg flex items-center justify-center text-cream-muted/30 hover:text-cream-muted hover:bg-surface-raised/50 transition-all duration-200"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className={`transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
              >
                <path d="M8 2L4 6l4 4" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" id="main-content">
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
