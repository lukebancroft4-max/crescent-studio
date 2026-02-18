import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function WaveformDisplay({ audioUrl, onReady, muteAudio = false, seekTime }) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(45, 122, 95, 0.3)",
      progressColor: "rgba(45, 122, 95, 0.85)",
      cursorColor: "rgba(30, 90, 67, 0.6)",
      barWidth: 2,
      barGap: 2,
      barRadius: 1,
      height: 100,
      responsive: true,
      backend: "WebAudio",
      cursorWidth: 1,
    });

    ws.load(audioUrl);

    ws.on("ready", () => {
      if (muteAudio) ws.setVolume(0);
      if (onReady) onReady(ws);
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  // Mute/unmute when stem mode changes
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    ws.setVolume(muteAudio ? 0 : 1);
  }, [muteAudio]);

  // Sync cursor position from Tone.js transport
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || seekTime === undefined || !ws.getDuration()) return;
    const progress = seekTime / ws.getDuration();
    if (progress >= 0 && progress <= 1) {
      ws.seekTo(progress);
    }
  }, [seekTime]);

  return (
    <div className="relative">
      {/* Glow behind waveform */}
      <div className="absolute inset-0 bg-gold/[0.04] rounded-lg blur-xl" />
      <div
        ref={containerRef}
        className="relative panel-inset rounded-lg p-4"
      />
    </div>
  );
}
