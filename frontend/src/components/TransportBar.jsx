import { useState } from "react";

export default function TransportBar({
  wavesurfer,
  currentBeat,
  onDownloadWav,
  onDownloadMidi,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function handlePlayPause() {
    if (!wavesurfer) return;
    wavesurfer.playPause();
    setIsPlaying(!isPlaying);
  }

  function handleStop() {
    if (!wavesurfer) return;
    wavesurfer.stop();
    setIsPlaying(false);
  }

  function handleLoopToggle() {
    setIsLooping(!isLooping);
  }

  // Update time from parent
  if (wavesurfer && !wavesurfer._transportBound) {
    wavesurfer.on("audioprocess", (time) => {
      setCurrentTime(time);
      setDuration(wavesurfer.getDuration());
    });
    wavesurfer.on("finish", () => {
      if (isLooping) {
        wavesurfer.play(0);
      } else {
        setIsPlaying(false);
      }
    });
    wavesurfer.on("seeking", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });
    wavesurfer._transportBound = true;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4 flex-wrap">
      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        disabled={!wavesurfer}
        className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center disabled:opacity-50 transition"
      >
        {isPlaying ? "\u23F8" : "\u25B6"}
      </button>

      {/* Stop */}
      <button
        onClick={handleStop}
        disabled={!wavesurfer}
        className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center disabled:opacity-50 transition"
      >
        {"\u23F9"}
      </button>

      {/* Time */}
      <span className="text-zinc-400 text-sm font-mono min-w-[80px]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Loop */}
      <button
        onClick={handleLoopToggle}
        className={`px-3 py-1 rounded-full text-sm transition ${
          isLooping
            ? "bg-emerald-600 text-white"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
        }`}
      >
        Loop
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Downloads */}
      {currentBeat && (
        <div className="flex gap-2">
          <button
            onClick={onDownloadWav}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition"
          >
            Download WAV
          </button>
          <button
            onClick={onDownloadMidi}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition"
          >
            Download MIDI
          </button>
        </div>
      )}
    </div>
  );
}
