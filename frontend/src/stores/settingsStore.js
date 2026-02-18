import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create(
  persist(
    (set) => ({
      defaultGenre: "afrobeats",
      defaultBpm: 106,
      defaultMood: "energetic",
      defaultKey: "A minor",
      defaultDuration: 120,
      outputFormat: "mp3",
      outputQuality: "192",
      darkMode: false,

      updateSetting: (key, value) => set({ [key]: value }),
    }),
    { name: "crescent-settings" }
  )
);
