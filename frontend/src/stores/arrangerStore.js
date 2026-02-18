import { create } from "zustand";
import * as Tone from "tone";

let _arrangePlayers = [];
let _arrangeChannels = [];
let _arrangeRafId = null;

export const useArrangerStore = create((set, get) => ({
  tracks: [
    { id: "track-1", name: "Track 1", muted: false, solo: false, regions: [] },
    { id: "track-2", name: "Track 2", muted: false, solo: false, regions: [] },
    { id: "track-3", name: "Track 3", muted: false, solo: false, regions: [] },
    { id: "track-4", name: "Track 4", muted: false, solo: false, regions: [] },
  ],

  timelineDuration: 120,
  pixelsPerSecond: 50,
  playheadPosition: 0,
  isPlaying: false,

  addTrack: () => {
    const { tracks } = get();
    const id = `track-${Date.now()}`;
    set({ tracks: [...tracks, { id, name: `Track ${tracks.length + 1}`, muted: false, solo: false, regions: [] }] });
  },

  removeTrack: (trackId) => {
    set({ tracks: get().tracks.filter((t) => t.id !== trackId) });
  },

  renameTrack: (trackId, name) => {
    set({
      tracks: get().tracks.map((t) => (t.id === trackId ? { ...t, name } : t)),
    });
  },

  addRegion: (trackId, region) => {
    set({
      tracks: get().tracks.map((t) =>
        t.id === trackId ? { ...t, regions: [...t.regions, region] } : t
      ),
    });
  },

  moveRegion: (regionId, newTrackId, newStartTime) => {
    const { tracks } = get();
    let movedRegion = null;

    // Remove from old track
    const cleaned = tracks.map((t) => ({
      ...t,
      regions: t.regions.filter((r) => {
        if (r.id === regionId) {
          movedRegion = { ...r, startTime: newStartTime };
          return false;
        }
        return true;
      }),
    }));

    if (!movedRegion) return;

    // Add to new track
    set({
      tracks: cleaned.map((t) =>
        t.id === newTrackId ? { ...t, regions: [...t.regions, movedRegion] } : t
      ),
    });
  },

  resizeRegion: (regionId, trimStart, trimEnd) => {
    set({
      tracks: get().tracks.map((t) => ({
        ...t,
        regions: t.regions.map((r) =>
          r.id === regionId ? { ...r, trimStart, trimEnd } : r
        ),
      })),
    });
  },

  removeRegion: (regionId) => {
    set({
      tracks: get().tracks.map((t) => ({
        ...t,
        regions: t.regions.filter((r) => r.id !== regionId),
      })),
    });
  },

  setZoom: (pps) => set({ pixelsPerSecond: pps }),

  playArrangement: async () => {
    const { tracks } = get();
    get().stopArrangement();

    const transport = Tone.getTransport();
    transport.cancel();
    transport.stop();
    transport.seconds = 0;

    const players = [];
    const channels = [];

    for (const track of tracks) {
      for (const region of track.regions) {
        const channel = new Tone.Channel({ mute: track.muted }).toDestination();
        const player = new Tone.Player(region.audioUrl);
        player.connect(channel);

        const offset = region.trimStart || 0;
        const dur = region.duration - (region.trimStart || 0) - (region.trimEnd || 0);
        player.sync().start(region.startTime, offset, dur);

        players.push(player);
        channels.push(channel);
      }
    }

    _arrangePlayers = players;
    _arrangeChannels = channels;

    await Tone.loaded();
    await Tone.start();
    transport.start();
    set({ isPlaying: true });

    function updatePlayhead() {
      set({ playheadPosition: Tone.getTransport().seconds });
      _arrangeRafId = requestAnimationFrame(updatePlayhead);
    }
    _arrangeRafId = requestAnimationFrame(updatePlayhead);
  },

  stopArrangement: () => {
    if (_arrangeRafId) cancelAnimationFrame(_arrangeRafId);
    _arrangeRafId = null;

    try {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      Tone.getTransport().seconds = 0;
    } catch (e) {}

    _arrangePlayers.forEach((p) => { try { p.dispose(); } catch (e) {} });
    _arrangeChannels.forEach((c) => { try { c.dispose(); } catch (e) {} });
    _arrangePlayers = [];
    _arrangeChannels = [];
    set({ isPlaying: false, playheadPosition: 0 });
  },
}));
