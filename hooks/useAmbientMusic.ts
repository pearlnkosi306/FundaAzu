import { useCallback, useEffect, useRef, useState } from "react";
import { logError } from "../lib/userErrors";

const BEAT_SECONDS = 0.5;
const BEATS_PER_CYCLE = (15 * 60) / BEAT_SECONDS;
const chordProgression = [
  { root: 48, notes: [60, 64, 67] },
  { root: 43, notes: [59, 62, 67] },
  { root: 45, notes: [57, 60, 64] },
  { root: 40, notes: [55, 60, 64] },
  { root: 41, notes: [57, 60, 65] },
  { root: 45, notes: [57, 60, 64] },
  { root: 38, notes: [57, 62, 65] },
  { root: 43, notes: [55, 59, 62] },
];

interface MusicSession {
  context: AudioContext;
  master: GainNode;
  timer: number;
  oscillators: Set<OscillatorNode>;
}

function midiFrequency(note: number) {
  return 440 * 2 ** ((note - 69) / 12);
}

export function useAmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.15);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<MusicSession | null>(null);
  const volumeRef = useRef(volume);

  useEffect(() => () => {
    const session = sessionRef.current;
    if (!session) return;
    window.clearInterval(session.timer);
    session.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // A note may already have ended naturally.
      }
    });
    void session.context.close();
    sessionRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const session = sessionRef.current;
    if (session) {
      window.clearInterval(session.timer);
      session.oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // A note may already have ended naturally.
        }
      });
      session.oscillators.clear();
      void session.context.close();
      sessionRef.current = null;
    }
    setPlaying(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    let context: AudioContext | null = null;
    try {
      const audioContext = new AudioContext();
      context = audioContext;
      await audioContext.resume();
      const master = audioContext.createGain();
      master.gain.value = volumeRef.current * 0.045;
      master.connect(audioContext.destination);

      const session: MusicSession = {
        context: audioContext,
        master,
        timer: 0,
        oscillators: new Set(),
      };
      sessionRef.current = session;

      const playNote = (
        midiNote: number,
        startAt: number,
        duration: number,
        voice: "piano" | "violin" | "cello",
      ) => {
        const frequency = midiFrequency(midiNote);
        const voiceGain = audioContext.createGain();
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = voice === "piano" ? 1800 : voice === "violin" ? 1400 : 650;
        filter.connect(voiceGain);
        voiceGain.connect(master);

        const peak = voice === "piano" ? 0.075 : voice === "cello" ? 0.05 : 0.032;
        const attack = voice === "piano" ? 0.018 : 0.35;
        const release = voice === "piano" ? 0.2 : 0.5;
        voiceGain.gain.setValueAtTime(0.0001, startAt);
        voiceGain.gain.exponentialRampToValueAtTime(peak, startAt + attack);
        voiceGain.gain.setValueAtTime(peak * (voice === "piano" ? 0.4 : 0.8), startAt + attack + 0.12);
        voiceGain.gain.setValueAtTime(peak * 0.32, startAt + duration - release);
        voiceGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

        const fundamental = audioContext.createOscillator();
        fundamental.type = voice === "piano" ? "sine" : "triangle";
        fundamental.frequency.setValueAtTime(frequency, startAt);
        fundamental.connect(filter);
        fundamental.start(startAt);
        fundamental.stop(startAt + duration + 0.05);
        session.oscillators.add(fundamental);
        if (voice === "piano") {
          const overtone = audioContext.createOscillator();
          const overtoneGain = audioContext.createGain();
          overtone.type = "sine";
          overtone.frequency.setValueAtTime(frequency * 2, startAt);
          overtoneGain.gain.value = 0.16;
          overtone.connect(overtoneGain);
          overtoneGain.connect(filter);
          overtone.start(startAt);
          overtone.stop(startAt + duration + 0.05);
          session.oscillators.add(overtone);
          overtone.onended = () => {
            session.oscillators.delete(overtone);
            overtone.disconnect();
            overtoneGain.disconnect();
          };
        }
        fundamental.onended = () => {
          session.oscillators.delete(fundamental);
          fundamental.disconnect();
          filter.disconnect();
          voiceGain.disconnect();
        };
      };

      let beat = 0;
      let nextBeatAt = audioContext.currentTime + 0.08;
      const schedule = () => {
        while (nextBeatAt <= audioContext.currentTime + 0.12) {
          const cycleBeat = beat % BEATS_PER_CYCLE;
          const bar = Math.floor(cycleBeat / 4);
          const section = Math.floor(bar / 16);
          const beatInBar = cycleBeat % 4;
          const chord = chordProgression[(bar + section) % chordProgression.length];
          const arpeggio = [0, 1, 2, 1][beatInBar];

          if (beatInBar === 0) {
            playNote(chord.root - 12, nextBeatAt, 1.9, "cello");
          }
          playNote(chord.notes[arpeggio] + 12, nextBeatAt, 0.46, "piano");
          if (beatInBar === 0 || beatInBar === 2) {
            playNote(chord.notes[(beatInBar + section) % 3] + 12, nextBeatAt, 0.9, "violin");
          }

          beat = (beat + 1) % BEATS_PER_CYCLE;
          nextBeatAt += BEAT_SECONDS;
        }
      };

      session.timer = window.setInterval(schedule, 80);
      schedule();
      setPlaying(true);
    } catch (failure) {
      if (context && context.state !== "closed") await context.close();
      sessionRef.current = null;
      setError(logError("music.start", failure));
      setPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (sessionRef.current) stop();
    else void start();
  }, [start, stop]);

  const setVolume = useCallback((nextVolume: number) => {
    const normalized = Math.max(0, Math.min(1, nextVolume));
    volumeRef.current = normalized;
    setVolumeState(normalized);
    const session = sessionRef.current;
    if (session) {
      session.master.gain.setTargetAtTime(normalized * 0.045, session.context.currentTime, 0.15);
    }
  }, []);

  return { playing, volume, error, toggle, setVolume };
}
