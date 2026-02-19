import { create } from "zustand";

let _nextId = 1;

export const EFFECT_DEFINITIONS = {
  EQ3: {
    label: "EQ3",
    defaults: { low: 0, mid: 0, high: 0, lowFrequency: 400, highFrequency: 2500 },
  },
  Reverb: {
    label: "Reverb",
    defaults: { decay: 2.5, wet: 0.4, preDelay: 0.01 },
  },
  Compressor: {
    label: "Compressor",
    defaults: { threshold: -24, ratio: 4, attack: 0.003, release: 0.25 },
  },
  FeedbackDelay: {
    label: "Delay",
    defaults: { delayTime: 0.25, feedback: 0.3, wet: 0.3 },
  },
  Distortion: {
    label: "Distortion",
    defaults: { distortion: 0.4, wet: 0.5 },
  },
  Chorus: {
    label: "Chorus",
    defaults: { frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.5 },
  },
  Phaser: {
    label: "Phaser",
    defaults: { frequency: 0.5, octaves: 3, baseFrequency: 350, wet: 0.5 },
  },
  PingPongDelay: {
    label: "Ping Pong",
    defaults: { delayTime: 0.2, feedback: 0.3, wet: 0.3 },
  },
  BitCrusher: {
    label: "BitCrusher",
    defaults: { bits: 8, wet: 0.5 },
  },
  Tremolo: {
    label: "Tremolo",
    defaults: { frequency: 4, depth: 0.6, wet: 0.5 },
  },
  AutoFilter: {
    label: "AutoFilter",
    defaults: { frequency: 1, baseFrequency: 200, octaves: 2.6, wet: 0.5 },
  },
  AutoPanner: {
    label: "AutoPanner",
    defaults: { frequency: 1, depth: 1, wet: 0.5 },
  },
};

export const PARAM_RANGES = {
  EQ3: {
    low: { min: -24, max: 24, step: 0.5, unit: "dB" },
    mid: { min: -24, max: 24, step: 0.5, unit: "dB" },
    high: { min: -24, max: 24, step: 0.5, unit: "dB" },
    lowFrequency: { min: 60, max: 1000, step: 10, unit: "Hz" },
    highFrequency: { min: 1000, max: 8000, step: 100, unit: "Hz" },
  },
  Reverb: {
    decay: { min: 0.1, max: 10, step: 0.1, unit: "s" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
    preDelay: { min: 0, max: 0.5, step: 0.01, unit: "s" },
  },
  Compressor: {
    threshold: { min: -60, max: 0, step: 1, unit: "dB" },
    ratio: { min: 1, max: 20, step: 0.5, unit: ":1" },
    attack: { min: 0.001, max: 1, step: 0.001, unit: "s" },
    release: { min: 0.01, max: 1, step: 0.01, unit: "s" },
  },
  FeedbackDelay: {
    delayTime: { min: 0.01, max: 1, step: 0.01, unit: "s" },
    feedback: { min: 0, max: 0.95, step: 0.01, unit: "" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  Distortion: {
    distortion: { min: 0, max: 1, step: 0.01, unit: "" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  Chorus: {
    frequency: { min: 0.1, max: 10, step: 0.1, unit: "Hz" },
    delayTime: { min: 0.5, max: 20, step: 0.5, unit: "ms" },
    depth: { min: 0, max: 1, step: 0.01, unit: "" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  Phaser: {
    frequency: { min: 0.1, max: 10, step: 0.1, unit: "Hz" },
    octaves: { min: 1, max: 6, step: 0.5, unit: "" },
    baseFrequency: { min: 100, max: 2000, step: 50, unit: "Hz" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  PingPongDelay: {
    delayTime: { min: 0.01, max: 1, step: 0.01, unit: "s" },
    feedback: { min: 0, max: 0.95, step: 0.01, unit: "" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  BitCrusher: {
    bits: { min: 1, max: 16, step: 1, unit: "bit" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  Tremolo: {
    frequency: { min: 0.1, max: 20, step: 0.1, unit: "Hz" },
    depth: { min: 0, max: 1, step: 0.01, unit: "" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  AutoFilter: {
    frequency: { min: 0.1, max: 10, step: 0.1, unit: "Hz" },
    baseFrequency: { min: 60, max: 2000, step: 10, unit: "Hz" },
    octaves: { min: 0.5, max: 8, step: 0.1, unit: "" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
  AutoPanner: {
    frequency: { min: 0.1, max: 10, step: 0.1, unit: "Hz" },
    depth: { min: 0, max: 1, step: 0.01, unit: "" },
    wet: { min: 0, max: 1, step: 0.01, unit: "" },
  },
};

export const useEffectChainStore = create((set, _get) => ({
  chains: {},

  addEffect: (stemIndex, type) => {
    const def = EFFECT_DEFINITIONS[type];
    if (!def) return;
    set((state) => {
      const chain = state.chains[stemIndex] || [];
      return {
        chains: {
          ...state.chains,
          [stemIndex]: [
            ...chain,
            { id: _nextId++, type, params: { ...def.defaults }, bypassed: false },
          ],
        },
      };
    });
  },

  removeEffect: (stemIndex, effectId) => {
    set((state) => {
      const chain = (state.chains[stemIndex] || []).filter((e) => e.id !== effectId);
      return { chains: { ...state.chains, [stemIndex]: chain } };
    });
  },

  updateParam: (stemIndex, effectId, paramKey, value) => {
    set((state) => {
      const chain = (state.chains[stemIndex] || []).map((e) =>
        e.id === effectId ? { ...e, params: { ...e.params, [paramKey]: value } } : e
      );
      return { chains: { ...state.chains, [stemIndex]: chain } };
    });
  },

  toggleBypass: (stemIndex, effectId) => {
    set((state) => {
      const chain = (state.chains[stemIndex] || []).map((e) =>
        e.id === effectId ? { ...e, bypassed: !e.bypassed } : e
      );
      return { chains: { ...state.chains, [stemIndex]: chain } };
    });
  },

  reorderEffect: (stemIndex, fromIndex, toIndex) => {
    set((state) => {
      const chain = [...(state.chains[stemIndex] || [])];
      const [moved] = chain.splice(fromIndex, 1);
      chain.splice(toIndex, 0, moved);
      return { chains: { ...state.chains, [stemIndex]: chain } };
    });
  },

  clearChain: (stemIndex) => {
    set((state) => ({
      chains: { ...state.chains, [stemIndex]: [] },
    }));
  },
}));
