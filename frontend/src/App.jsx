import { useState, useRef } from "react";
import ControlsPanel from "./components/ControlsPanel";
import WaveformDisplay from "./components/WaveformDisplay";
import TransportBar from "./components/TransportBar";
import TrackMixer from "./components/TrackMixer";
import { generateBeat, getAudioUrl, getMidiUrl } from "./api/client";

export default function App() {
  const [currentBeat, setCurrentBeat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wavesurfer, setWavesurfer] = useState(null);

  async function handleGenerate(params) {
    setIsLoading(true);
    setError(null);
    setCurrentBeat(null);
    setWavesurfer(null);

    try {
      const beat = await generateBeat(params);
      setCurrentBeat(beat);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadWav() {
    if (!currentBeat) return;
    window.open(getAudioUrl(currentBeat.id), "_blank");
  }

  function handleDownloadMidi() {
    if (!currentBeat) return;
    window.open(getMidiUrl(currentBeat.id), "_blank");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Beat Generator AI
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          AI-powered beat creation with HuggingFace MusicGen
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">
        {/* Left sidebar - Controls */}
        <aside className="w-full lg:w-80 shrink-0">
          <ControlsPanel onGenerate={handleGenerate} isLoading={isLoading} />
        </aside>

        {/* Main area */}
        <main className="flex-1 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-300">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="bg-zinc-900 rounded-xl p-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-400">Generating your beat...</p>
              <p className="text-zinc-600 text-sm">This may take 15-60 seconds</p>
            </div>
          )}

          {/* Waveform + Transport */}
          {currentBeat && !isLoading && (
            <>
              <WaveformDisplay
                audioUrl={getAudioUrl(currentBeat.id)}
                onReady={(ws) => setWavesurfer(ws)}
              />
              <TransportBar
                wavesurfer={wavesurfer}
                currentBeat={currentBeat}
                onDownloadWav={handleDownloadWav}
                onDownloadMidi={handleDownloadMidi}
              />
              <TrackMixer instruments={currentBeat.params.instruments} />
            </>
          )}

          {/* Empty state */}
          {!currentBeat && !isLoading && !error && (
            <div className="bg-zinc-900 rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="text-5xl mb-4">🎵</div>
              <h2 className="text-xl font-bold text-zinc-300">Ready to create</h2>
              <p className="text-zinc-500 mt-2 max-w-md">
                Select your genre, mood, and instruments, then hit Generate to create
                an AI-powered beat.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
