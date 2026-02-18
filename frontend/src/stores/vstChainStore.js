import { create } from "zustand";
import { useAudioStore } from "./audioStore";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

let _nextVstId = 1;

export const useVstChainStore = create((set, get) => ({
  vstChains: {},
  processedStems: {},

  addPlugin: (stemIndex, pluginPath, pluginName, params = {}) => {
    set((state) => {
      const chain = state.vstChains[stemIndex] || [];
      return {
        vstChains: {
          ...state.vstChains,
          [stemIndex]: [
            ...chain,
            {
              id: _nextVstId++,
              pluginPath,
              pluginName,
              params,
              isRendering: false,
            },
          ],
        },
      };
    });
  },

  removePlugin: (stemIndex, pluginId) => {
    set((state) => {
      const chain = (state.vstChains[stemIndex] || []).filter(
        (p) => p.id !== pluginId
      );
      return { vstChains: { ...state.vstChains, [stemIndex]: chain } };
    });
  },

  updateParam: (stemIndex, pluginId, paramKey, value) => {
    set((state) => {
      const chain = (state.vstChains[stemIndex] || []).map((p) =>
        p.id === pluginId
          ? { ...p, params: { ...p.params, [paramKey]: value } }
          : p
      );
      return { vstChains: { ...state.vstChains, [stemIndex]: chain } };
    });
  },

  renderStem: async (stemIndex, beatId, stemName) => {
    const chain = get().vstChains[stemIndex] || [];
    if (chain.length === 0) return;

    // Mark all plugins in chain as rendering
    set((state) => ({
      vstChains: {
        ...state.vstChains,
        [stemIndex]: chain.map((p) => ({ ...p, isRendering: true })),
      },
    }));

    try {
      const pluginChain = chain.map((p) => ({
        path: p.pluginPath,
        params: p.params,
      }));

      const res = await fetch(`${API_BASE}/plugins/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beat_id: beatId,
          stem_name: stemName,
          plugin_chain: pluginChain,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Render failed" }));
        throw new Error(err.detail || "Render failed");
      }

      const data = await res.json();

      set((state) => ({
        processedStems: {
          ...state.processedStems,
          [stemIndex]: data.url,
        },
      }));

      // Reload the stem in the audio engine
      useAudioStore.getState().reloadStem(stemIndex, data.url);
    } catch (err) {
      console.error("VST render failed:", err);
    } finally {
      // Unmark rendering
      set((state) => ({
        vstChains: {
          ...state.vstChains,
          [stemIndex]: (state.vstChains[stemIndex] || []).map((p) => ({
            ...p,
            isRendering: false,
          })),
        },
      }));
    }
  },

  clearProcessedStem: (stemIndex) => {
    set((state) => {
      const { [stemIndex]: _, ...rest } = state.processedStems;
      return { processedStems: rest };
    });
  },
}));
