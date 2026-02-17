import { useState } from "react";
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

  function handleDownloadAudio() {
    if (!currentBeat) return;
    window.open(getAudioUrl(currentBeat.id), "_blank");
  }

  function handleDownloadMidi() {
    if (!currentBeat) return;
    window.open(getMidiUrl(currentBeat.id), "_blank");
  }

  return (
    <div className="min-h-screen bg-noir">
      {/* Top ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/[0.03] rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-border-subtle">
        <div className="max-w-[1600px] mx-auto px-8 py-5 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-light tracking-[0.08em] text-cream text-gold-glow">
              CRESCENT
            </h1>
            <p className="font-display text-sm tracking-[0.2em] text-gold-dim mt-0.5 uppercase">
              Studio
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-cream-muted text-xs tracking-[0.15em] uppercase">
            <span>AI Beat Engine</span>
            <span className="w-1 h-1 rounded-full bg-gold/60" />
            <span>ElevenLabs v1</span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-r border-border-subtle">
          <ControlsPanel onGenerate={handleGenerate} isLoading={isLoading} />
        </aside>

        {/* Main workspace */}
        <main className="flex-1 p-6 lg:p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="animate-fade-up panel-inset rounded-lg p-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border border-danger/60 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-danger text-xs">!</span>
                </div>
                <div>
                  <p className="text-cream text-sm font-medium">Generation Failed</p>
                  <p className="text-cream-muted text-xs mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="animate-fade-up flex flex-col items-center justify-center py-24 gap-6">
              {/* Animated rings */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border border-gold/20 animate-spin-slow" />
                <div className="absolute inset-2 rounded-full border border-gold/40 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "2s" }} />
                <div className="absolute inset-4 rounded-full border border-gold/60 animate-spin-slow" style={{ animationDuration: "1.5s" }} />
                <div className="absolute inset-[30px] rounded-full bg-gold/20 animate-pulse-gold" />
              </div>
              <div className="text-center">
                <p className="font-display text-xl text-cream tracking-wide">Composing</p>
                <p className="text-cream-muted text-xs tracking-[0.15em] uppercase mt-2">
                  ElevenLabs is generating your beat
                </p>
              </div>
            </div>
          )}

          {/* Waveform + Transport + Mixer */}
          {currentBeat && !isLoading && (
            <div className="space-y-4 animate-fade-up">
              {/* Beat info bar */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-lg text-cream tracking-wide">
                    {currentBeat.params.genre.replace("-", " ").toUpperCase()}
                  </p>
                  <p className="text-cream-muted text-xs tracking-[0.1em] mt-0.5">
                    {currentBeat.params.bpm} BPM &middot; {currentBeat.params.key} &middot; {currentBeat.params.duration}s
                  </p>
                </div>
                <span className="text-gold-dim text-xs tracking-[0.15em] uppercase font-medium">
                  {currentBeat.id}
                </span>
              </div>

              {/* Waveform */}
              <WaveformDisplay
                audioUrl={getAudioUrl(currentBeat.id)}
                onReady={(ws) => setWavesurfer(ws)}
              />

              {/* Transport */}
              <TransportBar
                wavesurfer={wavesurfer}
                currentBeat={currentBeat}
                onDownloadAudio={handleDownloadAudio}
                onDownloadMidi={handleDownloadMidi}
              />

              {/* Mixer */}
              <TrackMixer instruments={currentBeat.params.instruments} />
            </div>
          )}

          {/* Empty state */}
          {!currentBeat && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
              {/* Abstract waveform icon */}
              <div className="flex items-end gap-[3px] h-16 mb-8 opacity-20">
                {[20, 35, 55, 40, 60, 45, 30, 50, 35, 55, 25, 45, 60, 35, 20].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-gold rounded-full"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-cream/80 tracking-wide font-light">
                Your Studio Awaits
              </h2>
              <p className="text-cream-muted text-sm mt-3 max-w-md leading-relaxed">
                Configure your sound on the left, or write a custom prompt to
                describe exactly what you hear in your mind.
              </p>
              <div className="flex items-center gap-3 mt-8 text-gold-dim text-xs tracking-[0.15em] uppercase">
                <span>Select</span>
                <span className="w-8 h-px bg-gold-dim/40" />
                <span>Configure</span>
                <span className="w-8 h-px bg-gold-dim/40" />
                <span>Generate</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
