import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function WaveformDisplay({ audioUrl, onReady }) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(201, 169, 110, 0.35)",
      progressColor: "rgba(201, 169, 110, 0.85)",
      cursorColor: "rgba(228, 201, 138, 0.6)",
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
      if (onReady) onReady(ws);
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  return (
    <div className="relative">
      {/* Glow behind waveform */}
      <div className="absolute inset-0 bg-gold/[0.02] rounded-lg blur-xl" />
      <div
        ref={containerRef}
        className="relative panel-inset rounded-lg p-4"
      />
    </div>
  );
}
