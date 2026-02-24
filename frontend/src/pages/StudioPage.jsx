import { useAudioStore } from "../stores/audioStore";
import ControlsPanel from "../components/ControlsPanel";
import WaveformDisplay from "../components/WaveformDisplay";
import TrackMixer from "../components/TrackMixer";
import PlanPreview from "../components/PlanPreview";
import { getAudioUrl } from "../api/client";

export default function StudioPage() {
  const currentBeat = useAudioStore((s) => s.currentBeat);
  const stemData = useAudioStore((s) => s.stemData);
  const isLoading = useAudioStore((s) => s.isLoading);
  const isSeparating = useAudioStore((s) => s.isSeparating);
  const error = useAudioStore((s) => s.error);
  const planData = useAudioStore((s) => s.planData);
  const isLoaded = useAudioStore((s) => s.isLoaded);
  const currentTime = useAudioStore((s) => s.currentTime);
  const generateBeat = useAudioStore((s) => s.generateBeat);
  const generateFromPlan = useAudioStore((s) => s.generateFromPlan);
  const renderOffline = useAudioStore((s) => s.renderOffline);
  const setPlanData = useAudioStore((s) => s.setPlanData);

  const hasStemMixer = !!(stemData && isLoaded);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Sidebar */}
      <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-r border-border-subtle overflow-y-auto">
        <ControlsPanel
          onGenerate={generateBeat}
          isLoading={isLoading}
          onPlanCreated={(plan) => setPlanData(plan)}
          onRenderOffline={renderOffline}
        />
      </aside>

      {/* Main workspace */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Error */}
        {error && (
          <div className="animate-fade-up panel-inset rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border border-danger/60 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-danger text-xs">!</span>
              </div>
              <div className="flex-1">
                <p className="text-cream text-sm font-medium">Generation Failed</p>
                <p className="text-cream-muted text-xs mt-1 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => useAudioStore.setState({ error: null })}
                className="text-cream-muted/40 hover:text-cream-muted transition-colors shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="animate-fade-up flex flex-col items-center justify-center py-24 gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border border-gold/30 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border border-gold/50 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "2s" }} />
              <div className="absolute inset-4 rounded-full border border-gold/70 animate-spin-slow" style={{ animationDuration: "1.5s" }} />
              <div className="absolute inset-[30px] rounded-full bg-gold/25 animate-pulse-gold" />
            </div>
            <div className="text-center">
              <p className="font-display text-xl text-cream tracking-wide">Composing</p>
              <p className="text-cream-muted text-xs tracking-[0.15em] uppercase mt-2">
                ElevenLabs is generating your beat
              </p>
            </div>
          </div>
        )}

        {/* Plan Preview */}
        {planData && !isLoading && !currentBeat && (
          <PlanPreview
            plan={planData}
            onGenerate={generateFromPlan}
            onDiscard={() => setPlanData(null)}
          />
        )}

        {/* Waveform + Mixer */}
        {currentBeat && !isLoading && (
          <div className="space-y-4 animate-fade-up">
            {/* Beat info bar */}
            <div className="flex items-center justify-between">
              <div>
                {currentBeat.params ? (
                  <>
                    <p className="font-display text-lg text-cream tracking-wide">
                      {currentBeat.params.genre.replace("-", " ").toUpperCase()}
                    </p>
                    <p className="text-cream-muted text-xs tracking-[0.1em] mt-0.5">
                      {currentBeat.params.bpm} BPM &middot; {currentBeat.params.key} &middot; {currentBeat.params.duration}s
                    </p>
                  </>
                ) : (
                  <p className="font-display text-lg text-cream tracking-wide">
                    FROM COMPOSITION PLAN
                  </p>
                )}
              </div>
              <span className="text-gold-dim text-xs tracking-[0.15em] uppercase font-medium">
                {currentBeat.id}
              </span>
            </div>

            {/* Waveform */}
            <WaveformDisplay
              audioUrl={getAudioUrl(currentBeat.id)}
              muteAudio={hasStemMixer}
              seekTime={hasStemMixer ? currentTime : undefined}
            />

            {/* Stem separating indicator */}
            {isSeparating && (
              <div className="panel rounded-lg p-4 flex items-center justify-center gap-3">
                <div className="w-3 h-3 rounded-full border border-gold/40 animate-spin-slow" />
                <p className="text-cream-muted text-xs tracking-[0.15em] uppercase">
                  Separating stems...
                </p>
              </div>
            )}

            {/* Mixer */}
            {hasStemMixer ? (
              <TrackMixer
                stems={stemData.stems}
                beatId={currentBeat.id}
              />
            ) : !isSeparating && currentBeat.params ? (
              <TrackMixer instruments={currentBeat.params.instruments} />
            ) : null}
          </div>
        )}

        {/* Empty state */}
        {!currentBeat && !isLoading && !error && !planData && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
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
  );
}
