import { useState, useRef, useCallback, useEffect } from "react";
import * as Tone from "tone";

export default function useMultiTrackPlayer(stemUrls) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);

  const playersRef = useRef([]);
  const channelsRef = useRef([]);
  const rafRef = useRef(null);
  const durationRef = useRef(0);
  const loopingRef = useRef(false);

  useEffect(() => {
    if (!stemUrls || stemUrls.length === 0) {
      cleanup();
      return;
    }

    cleanup();
    setIsLoaded(false);

    const players = [];
    const channels = [];
    let loadedCount = 0;

    const transport = Tone.getTransport();
    transport.cancel();
    transport.stop();
    transport.seconds = 0;

    stemUrls.forEach((url) => {
      const channel = new Tone.Channel({ volume: 0, mute: false }).toDestination();
      const player = new Tone.Player({
        url,
        onload: () => {
          loadedCount++;
          if (loadedCount === stemUrls.length) {
            const maxDur = Math.max(...players.map((p) => p.buffer.duration));
            setDuration(maxDur);
            durationRef.current = maxDur;
            setIsLoaded(true);
          }
        },
      });
      player.connect(channel);
      player.sync().start(0);

      players.push(player);
      channels.push(channel);
    });

    playersRef.current = players;
    channelsRef.current = channels;

    return cleanup;
  }, [stemUrls]);

  useEffect(() => {
    loopingRef.current = isLooping;
    const transport = Tone.getTransport();
    transport.loop = isLooping;
    if (isLooping && duration > 0) {
      transport.setLoopPoints(0, duration);
    }
  }, [isLooping, duration]);

  function startTimeUpdate() {
    const update = () => {
      const transport = Tone.getTransport();
      const t = transport.seconds;
      setCurrentTime(t);

      if (
        !loopingRef.current &&
        durationRef.current > 0 &&
        t >= durationRef.current
      ) {
        transport.stop();
        transport.seconds = 0;
        setIsPlaying(false);
        setCurrentTime(0);
        return;
      }

      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
  }

  function stopTimeUpdate() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  const play = useCallback(async () => {
    await Tone.start();
    Tone.getTransport().start();
    setIsPlaying(true);
    startTimeUpdate();
  }, []);

  const pause = useCallback(() => {
    Tone.getTransport().pause();
    setIsPlaying(false);
    stopTimeUpdate();
  }, []);

  const stop = useCallback(() => {
    Tone.getTransport().stop();
    Tone.getTransport().seconds = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    stopTimeUpdate();
  }, []);

  const seek = useCallback((timeInSeconds) => {
    Tone.getTransport().seconds = timeInSeconds;
    setCurrentTime(timeInSeconds);
  }, []);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const setVolume = useCallback((index, value) => {
    const channel = channelsRef.current[index];
    if (!channel) return;
    if (value === 0) {
      channel.volume.value = -Infinity;
    } else {
      channel.volume.value = -40 + (value / 100) * 40;
    }
  }, []);

  const setMute = useCallback((index, muted) => {
    const channel = channelsRef.current[index];
    if (channel) channel.mute = muted;
  }, []);

  const setSolo = useCallback((index, soloed) => {
    const channel = channelsRef.current[index];
    if (channel) channel.solo = soloed;
  }, []);

  function cleanup() {
    stopTimeUpdate();
    try {
      const transport = Tone.getTransport();
      transport.stop();
      transport.cancel();
      transport.seconds = 0;
      transport.loop = false;
    } catch (e) {
      // Transport may not be initialized
    }
    playersRef.current.forEach((p) => {
      try { p.dispose(); } catch (e) {}
    });
    channelsRef.current.forEach((c) => {
      try { c.dispose(); } catch (e) {}
    });
    playersRef.current = [];
    channelsRef.current = [];
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    durationRef.current = 0;
  }

  return {
    isLoaded,
    isPlaying,
    currentTime,
    duration,
    isLooping,
    play,
    pause,
    stop,
    seek,
    toggleLoop,
    setVolume,
    setMute,
    setSolo,
  };
}
