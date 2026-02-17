import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

export default function WaveformDisplay({ audioUrl, onReady, onTimeUpdate }) {
  const containerRef = useRef(null);
  const wavesurferRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    // Destroy previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#7c3aed",
      progressColor: "#a855f7",
      cursorColor: "#e879f9",
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
      responsive: true,
      backend: "WebAudio",
    });

    ws.load(audioUrl);

    ws.on("ready", () => {
      if (onReady) onReady(ws);
    });

    ws.on("audioprocess", (time) => {
      if (onTimeUpdate) onTimeUpdate(time, ws.getDuration());
    });

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [audioUrl]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-zinc-900 rounded-lg p-2"
    />
  );
}
