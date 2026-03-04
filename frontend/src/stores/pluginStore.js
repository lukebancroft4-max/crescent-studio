import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export const usePluginStore = create((set, _get) => ({
  plugins: [],
  isScanning: false,
  error: null,

  scanPlugins: async (extraDirs = []) => {
    set({ isScanning: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/plugins/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extra_dirs: extraDirs }),
      });
      if (!res.ok) throw new Error("Scan failed");
      const data = await res.json();
      set({ plugins: data.plugins });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isScanning: false });
    }
  },

  loadPlugins: async () => {
    try {
      const res = await fetch(`${API_BASE}/plugins/list`);
      if (!res.ok) throw new Error("Failed to load plugins");
      const data = await res.json();
      set({ plugins: data.plugins });
    } catch (err) {
      set({ error: err.message });
    }
  },
}));
