import { useState, useEffect, useRef } from "react";
import { fetchHistory, getAudioUrl, getMidiUrl, getStemsZipUrl } from "../api/client";
import { useAudioStore } from "../stores/audioStore";
import { useNavigate } from "react-router-dom";

export default function LibraryPage() {
  const [beats, setBeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const loadBeat = useAudioStore((s) => s.loadBeat);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory()
      .then((data) => setBeats(data.beats || data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const genres = [...new Set(beats.map((b) => b.params?.genre).filter(Boolean))];

  const filtered = beats.filter((b) => {
    if (genreFilter !== "all" && b.params?.genre !== genreFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const genre = (b.params?.genre || "").toLowerCase();
      const mood = (b.params?.mood || "").toLowerCase();
      const key = (b.params?.key || "").toLowerCase();
      const id = (b.id || "").toLowerCase();
      if (!genre.includes(q) && !mood.includes(q) && !key.includes(q) && !id.includes(q)) return false;
    }
    return true;
  });

  function handleLoadInStudio(beat) {
    loadBeat(beat);
    navigate("/");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 rounded-full border border-gold/40 animate-spin-slow" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl text-cream tracking-wide">Beat Library</h2>
          <p className="text-cream-muted text-xs tracking-[0.1em] mt-1">
            {beats.length} beat{beats.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              viewMode === "grid" ? "bg-gold/15 text-gold" : "text-cream-muted/40 hover:text-cream-muted"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="0" y="0" width="6" height="6" rx="1" />
              <rect x="8" y="0" width="6" height="6" rx="1" />
              <rect x="0" y="8" width="6" height="6" rx="1" />
              <rect x="8" y="8" width="6" height="6" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
              viewMode === "list" ? "bg-gold/15 text-gold" : "text-cream-muted/40 hover:text-cream-muted"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="0" y1="3" x2="14" y2="3" />
              <line x1="0" y1="7" x2="14" y2="7" />
              <line x1="0" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search genre, mood, key..."
          className="flex-1 min-w-[200px] bg-surface text-cream text-sm rounded-md px-4 py-2.5 border border-border-subtle focus:border-gold/40 transition-colors placeholder-cream-muted/40"
        />
        <select
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="bg-surface text-cream text-sm rounded-md px-4 py-2.5 border border-border-subtle focus:border-gold/40 transition-colors appearance-none cursor-pointer pr-8"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%232D7A5F' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 8px center",
          }}
        >
          <option value="all">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g.replace("-", " ")}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="panel-inset rounded-lg p-4">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" className="text-cream-muted/20 mb-4">
            <rect x="4" y="4" width="16" height="16" rx="3" />
            <rect x="28" y="4" width="16" height="16" rx="3" />
            <rect x="4" y="28" width="16" height="16" rx="3" />
            <rect x="28" y="28" width="16" height="16" rx="3" />
          </svg>
          <p className="text-cream-muted text-sm">
            {beats.length === 0 ? "No beats generated yet" : "No beats match your search"}
          </p>
          <p className="text-cream-muted/50 text-xs mt-1">
            {beats.length === 0 ? "Head to the Studio to create your first beat" : "Try adjusting your filters"}
          </p>
        </div>
      )}

      {/* Beat grid */}
      {filtered.length > 0 && (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2"
        }>
          {filtered.map((beat) => (
            <BeatCard
              key={beat.id}
              beat={beat}
              viewMode={viewMode}
              onLoadInStudio={() => handleLoadInStudio(beat)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BeatCard({ beat, viewMode, onLoadInStudio }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function togglePreview() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnd = () => setPlaying(false);
    el.addEventListener("ended", onEnd);
    return () => el.removeEventListener("ended", onEnd);
  }, []);

  const genre = beat.params?.genre?.replace("-", " ") || "Unknown";
  const bpm = beat.params?.bpm || "—";
  const key = beat.params?.key || "—";
  const mood = beat.params?.mood || "";
  const duration = beat.params?.duration || "—";
  const date = beat.created_at ? new Date(beat.created_at).toLocaleDateString() : "";

  if (viewMode === "list") {
    return (
      <div className="panel rounded-lg px-4 py-3 flex items-center gap-4 group hover:bg-surface-raised/50 transition-colors">
        <audio ref={audioRef} src={getAudioUrl(beat.id)} preload="none" />
        <button
          onClick={togglePreview}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gold/10 text-gold shrink-0"
        >
          {playing ? (
            <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="2" width="3" height="10" rx="1" />
              <rect x="9" y="2" width="3" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 1.5L12 7L3 12.5V1.5Z" />
            </svg>
          )}
        </button>
        <span className="text-cream text-sm font-medium capitalize w-28 truncate">{genre}</span>
        <span className="text-cream-muted text-xs tabular-nums w-16">{bpm} BPM</span>
        <span className="text-cream-muted text-xs w-20">{key}</span>
        <span className="text-cream-muted/50 text-xs capitalize flex-1">{mood}</span>
        <span className="text-cream-muted/40 text-[10px]">{date}</span>
        <button
          onClick={onLoadInStudio}
          className="px-3 py-1.5 rounded text-[10px] tracking-[0.08em] uppercase text-gold border border-gold/30 hover:bg-gold/10 transition-all opacity-0 group-hover:opacity-100"
        >
          Open
        </button>
        <button
          onClick={() => window.open(getAudioUrl(beat.id), "_blank")}
          className="w-7 h-7 rounded flex items-center justify-center text-cream-muted/40 hover:text-cream-muted transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 1v8M3 6.5L6 9.5 9 6.5M1 11h10" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="panel rounded-lg overflow-hidden group">
      <audio ref={audioRef} src={getAudioUrl(beat.id)} preload="none" />
      {/* Top color strip */}
      <div className="h-1 bg-gradient-to-r from-gold/60 via-gold to-gold-bright/60" />
      <div className="p-4 space-y-3">
        {/* Genre + play */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-cream text-sm font-medium capitalize tracking-wide">{genre}</p>
            <p className="text-cream-muted/50 text-[10px] mt-0.5">{date}</p>
          </div>
          <button
            onClick={togglePreview}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{
              background: playing
                ? "rgba(45,122,95,0.12)"
                : "linear-gradient(135deg, rgba(45,122,95,0.9), rgba(30,90,67,0.9))",
            }}
          >
            {playing ? (
              <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor" className="text-gold">
                <rect x="2" y="2" width="3" height="10" rx="1" />
                <rect x="9" y="2" width="3" height="10" rx="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor" className="text-white ml-0.5">
                <path d="M3 1.5L12 7L3 12.5V1.5Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded text-[9px] tracking-[0.06em] uppercase bg-gold/10 text-gold border border-gold/20">
            {bpm} BPM
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] tracking-[0.06em] uppercase bg-surface-raised text-cream-muted border border-border-subtle">
            {key}
          </span>
          {mood && (
            <span className="px-2 py-0.5 rounded text-[9px] tracking-[0.06em] uppercase bg-surface-raised text-cream-muted border border-border-subtle capitalize">
              {mood}
            </span>
          )}
          <span className="px-2 py-0.5 rounded text-[9px] tracking-[0.06em] uppercase text-cream-muted/50 border border-border-subtle">
            {duration}s
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5 pt-1">
          <button
            onClick={onLoadInStudio}
            className="flex-1 py-2 rounded text-[10px] tracking-[0.08em] uppercase text-gold border border-gold/30 hover:bg-gold/10 transition-all"
          >
            Load in Studio
          </button>
          <button
            onClick={() => window.open(getAudioUrl(beat.id), "_blank")}
            className="px-2.5 py-2 rounded text-[10px] tracking-[0.08em] uppercase text-cream-muted/60 border border-border-subtle hover:text-cream-muted transition-all"
          >
            MP3
          </button>
          <button
            onClick={() => window.open(getMidiUrl(beat.id), "_blank")}
            className="px-2.5 py-2 rounded text-[10px] tracking-[0.08em] uppercase text-cream-muted/60 border border-border-subtle hover:text-cream-muted transition-all"
          >
            MIDI
          </button>
        </div>
      </div>
    </div>
  );
}
