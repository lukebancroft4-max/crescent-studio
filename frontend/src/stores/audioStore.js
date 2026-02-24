import { create } from "zustand";
import * as Tone from "tone";
import {
  generateBeat as apiGenerateBeat,
  separateStems as apiSeparateStems,
  getStemUrl,
  getAudioUrl,
  generateFromPlan as apiGenerateFromPlan,
  renderOffline as apiRenderOffline,
} from "../api/client";

let _players = [];
let _channels = [];
let _effectNodes = [];
let _rafId = null;
let _durationRef = 0;
let _loopingRef = false;

function startTimeUpdate(set, get) {
  function update() {
    const transport = Tone.getTransport();
    const t = transport.seconds;
    set({ currentTime: t });

    if (!_loopingRef && _durationRef > 0 && t >= _durationRef) {
      transport.stop();
      transport.seconds = 0;
      set({ isPlaying: false, currentTime: 0 });
      return;
    }
    _rafId = requestAnimationFrame(() => update());
  }
  _rafId = requestAnimationFrame(() => update());
}

function stopTimeUpdate() {
  if (_rafId) {
    cancelAnimationFrame(_rafId);
    _rafId = null;
  }
}

function cleanupAudio(set) {
  stopTimeUpdate();
  try {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    transport.seconds = 0;
    transport.loop = false;
  } catch (e) {}
  _players.forEach((p) => { try { p.dispose(); } catch (e) {} });
  _channels.forEach((c) => { try { c.dispose(); } catch (e) {} });
  _effectNodes.forEach((nodes) => {
    if (nodes) nodes.forEach((n) => { try { n.dispose(); } catch (e) {} });
  });
  _players = [];
  _channels = [];
  _effectNodes = [];
  _durationRef = 0;
  set({ isPlaying: false, currentTime: 0, duration: 0, isLoaded: false });
}

export function rebuildEffectChain(stemIndex, effectDescriptors) {
  const player = _players[stemIndex];
  const channel = _channels[stemIndex];
  if (!player || !channel) return;

  // Dispose old effect nodes for this stem
  if (_effectNodes[stemIndex]) {
    _effectNodes[stemIndex].forEach((n) => { try { n.dispose(); } catch (e) {} });
  }

  // Disconnect player from everything
  player.disconnect();

  // Build new nodes from descriptors (skip bypassed)
  const active = (effectDescriptors || []).filter((d) => !d.bypassed);
  const nodes = active.map((desc) => {
    const EffectClass = Tone[desc.type];
    if (!EffectClass) return null;
    return new EffectClass(desc.params);
  }).filter(Boolean);

  _effectNodes[stemIndex] = nodes;

  // Wire chain: player → node[0] → node[1] → ... → channel
  if (nodes.length === 0) {
    player.connect(channel);
  } else {
    player.connect(nodes[0]);
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].connect(nodes[i + 1]);
    }
    nodes[nodes.length - 1].connect(channel);
  }
}

export function updateEffectParam(stemIndex, effectIndex, paramKey, value) {
  const nodes = _effectNodes[stemIndex];
  if (!nodes || !nodes[effectIndex]) return;
  const node = nodes[effectIndex];
  const param = node[paramKey];
  if (param && typeof param.rampTo === "function") {
    param.rampTo(value, 0.05);
  } else if (param !== undefined) {
    node[paramKey] = value;
  }
}

export const useAudioStore = create((set, get) => ({
  // Beat state
  currentBeat: null,
  stemData: null,
  isLoading: false,
  isSeparating: false,
  error: null,
  planData: null,

  // Audio engine state
  isLoaded: false,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLooping: false,

  // Transport owner
  transportOwner: "studio",

  // Actions
  generateBeat: async (params) => {
    cleanupAudio(set);
    set({ isLoading: true, error: null, currentBeat: null, stemData: null, planData: null });

    try {
      const beat = await apiGenerateBeat(params);
      set({ currentBeat: beat });

      set({ isSeparating: true });
      try {
        const stems = await apiSeparateStems(beat.id);
        set({ stemData: stems });
        get().loadStems(stems);
      } catch (sepErr) {
        console.warn("Stem separation failed:", sepErr);
      } finally {
        set({ isSeparating: false });
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  generateFromPlan: async (plan, seed) => {
    cleanupAudio(set);
    set({ isLoading: true, error: null, currentBeat: null, stemData: null, planData: null });

    try {
      const beat = await apiGenerateFromPlan(plan, seed);
      set({ currentBeat: beat });

      set({ isSeparating: true });
      try {
        const stems = await apiSeparateStems(beat.id);
        set({ stemData: stems });
        get().loadStems(stems);
      } catch (sepErr) {
        console.warn("Stem separation failed:", sepErr);
      } finally {
        set({ isSeparating: false });
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  renderOffline: async (params) => {
    cleanupAudio(set);
    set({ isLoading: true, error: null, currentBeat: null, stemData: null, planData: null });

    try {
      const beat = await apiRenderOffline(params);
      set({ currentBeat: beat, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadBeat: (beat) => {
    cleanupAudio(set);
    set({ currentBeat: beat, stemData: null, error: null, planData: null });
  },

  loadStems: (stemData) => {
    cleanupAudio(set);
    if (!stemData || !stemData.stems.length) return;

    const stemUrls = stemData.stems.map((name) => getStemUrl(stemData.beat_id, name));
    const transport = Tone.getTransport();
    transport.cancel();
    transport.stop();
    transport.seconds = 0;

    let loadedCount = 0;
    const players = [];
    const channels = [];

    stemUrls.forEach((url) => {
      const channel = new Tone.Channel({ volume: 0, mute: false }).toDestination();
      const player = new Tone.Player({
        url,
        onload: () => {
          loadedCount++;
          if (loadedCount === stemUrls.length) {
            const maxDur = Math.max(...players.map((p) => p.buffer.duration));
            _durationRef = maxDur;
            set({ duration: maxDur, isLoaded: true });
          }
        },
      });
      player.connect(channel);
      player.sync().start(0);
      players.push(player);
      channels.push(channel);
    });

    _players = players;
    _channels = channels;
    _effectNodes = players.map(() => []);
    set({ stemData, transportOwner: "studio" });
  },

  reloadStem: (stemIndex, newUrl) => {
    const player = _players[stemIndex];
    if (!player) return;

    const wasPlaying = get().isPlaying;
    const currentTime = Tone.getTransport().seconds;

    player.load(newUrl).then(() => {
      if (wasPlaying) {
        Tone.getTransport().seconds = currentTime;
      }
    });
  },

  setPlanData: (plan) => set({ planData: plan }),

  play: async () => {
    await Tone.start();
    Tone.getTransport().start();
    set({ isPlaying: true });
    startTimeUpdate(set, get);
  },

  pause: () => {
    Tone.getTransport().pause();
    set({ isPlaying: false });
    stopTimeUpdate();
  },

  stop: () => {
    Tone.getTransport().stop();
    Tone.getTransport().seconds = 0;
    set({ isPlaying: false, currentTime: 0 });
    stopTimeUpdate();
  },

  seek: (time) => {
    Tone.getTransport().seconds = time;
    set({ currentTime: time });
  },

  toggleLoop: () => {
    const newLoop = !get().isLooping;
    _loopingRef = newLoop;
    const transport = Tone.getTransport();
    transport.loop = newLoop;
    if (newLoop && _durationRef > 0) {
      transport.setLoopPoints(0, _durationRef);
    }
    set({ isLooping: newLoop });
  },

  setVolume: (index, value) => {
    const channel = _channels[index];
    if (!channel) return;
    channel.volume.value = value === 0 ? -Infinity : -40 + (value / 100) * 40;
  },

  setMute: (index, muted) => {
    const channel = _channels[index];
    if (channel) channel.mute = muted;
  },

  setSolo: (index, soloed) => {
    const channel = _channels[index];
    if (channel) channel.solo = soloed;
  },

  cleanup: () => cleanupAudio(set),
}));
