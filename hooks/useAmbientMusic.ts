import { useCallback, useRef, useState } from "react";

export function useAmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.2);
  const contextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ oscillators: OscillatorNode[]; gain: GainNode } | null>(null);

  const stop = useCallback(() => {
    nodesRef.current?.oscillators.forEach((oscillator) => oscillator.stop());
    nodesRef.current = null;
    void contextRef.current?.close();
    contextRef.current = null;
    setPlaying(false);
  }, []);

  const start = useCallback(async () => {
    const context = new AudioContext();
    contextRef.current = context;
    await context.resume();
    const gain = context.createGain();
    gain.gain.value = volume * 0.12;
    gain.connect(context.destination);
    const oscillators = [110, 164.81, 220].map((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = index === 1 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      return oscillator;
    });
    nodesRef.current = { oscillators, gain };
    setPlaying(true);
  }, [volume]);

  const toggle = useCallback(() => {
    if (playing) stop();
    else void start();
  }, [playing, start, stop]);

  const setVolume = useCallback((nextVolume: number) => {
    const normalized = Math.max(0, Math.min(1, nextVolume));
    setVolumeState(normalized);
    if (nodesRef.current) nodesRef.current.gain.gain.value = normalized * 0.12;
  }, []);

  return { playing, volume, toggle, setVolume };
}
