import { useState, useRef, useEffect, useCallback } from 'react';
import { playTick, SoundProfile, BeatType } from '../services/audioSynthesizer';
import { calculateTapTempo } from '../utils/tempoUtils';

export function useMetronomeEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(120);
  const [timeSignature, setTimeSignatureState] = useState<number>(4);
  const [beatStates, setBeatStates] = useState<BeatType[]>(['accent', 'normal', 'normal', 'normal']);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('woodblock');
  const [volume, setVolume] = useState(0.8);
  const [currentBeat, setCurrentBeat] = useState<number>(-1);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const currentBeatRef = useRef<number>(0);
  const timerWorkerIdRef = useRef<number | null>(null);
  const tapsRef = useRef<number[]>([]);

  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const beatStatesRef = useRef(beatStates);
  beatStatesRef.current = beatStates;
  const soundProfileRef = useRef(soundProfile);
  soundProfileRef.current = soundProfile;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const setTimeSignature = useCallback((ts: number) => {
    setTimeSignatureState(ts);
    setBeatStates(prev => {
      const newStates: BeatType[] = [];
      for (let i = 0; i < ts; i++) {
        if (i === 0) newStates.push('accent');
        else if (i < prev.length) newStates.push(prev[i]);
        else newStates.push('normal');
      }
      return newStates;
    });
  }, []);

  const setBpm = useCallback((newBpm: number) => {
    const clamped = Math.min(300, Math.max(30, Math.round(newBpm)));
    setBpmState(clamped);
  }, []);

  const cycleBeatState = useCallback((index: number) => {
    setBeatStates(prev => {
      const copy = [...prev];
      const current = copy[index];
      if (current === 'accent') copy[index] = 'normal';
      else if (current === 'normal') copy[index] = 'mute';
      else copy[index] = 'accent';
      return copy;
    });
  }, []);

  const scheduler = useCallback(() => {
    if (!audioCtxRef.current) return;
    const scheduleAheadTime = 0.1;
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      const beatIdx = currentBeatRef.current;
      const bStates = beatStatesRef.current;
      const beatType = bStates[beatIdx % bStates.length] || 'normal';

      playTick(audioCtxRef.current, nextNoteTimeRef.current, beatType, soundProfileRef.current, volumeRef.current);

      const delayMs = Math.max(0, (nextNoteTimeRef.current - audioCtxRef.current.currentTime) * 1000);
      const activeBeat = beatIdx % bStates.length;
      setTimeout(() => {
        setCurrentBeat(activeBeat);
      }, delayMs);

      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current += 1;
    }
  }, []);

  const startMetronome = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    currentBeatRef.current = 0;
    nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.05;
    setIsPlaying(true);

    const intervalId = window.setInterval(scheduler, 25);
    timerWorkerIdRef.current = intervalId;
  }, [scheduler]);

  const stopMetronome = useCallback(() => {
    if (timerWorkerIdRef.current !== null) {
      clearInterval(timerWorkerIdRef.current);
      timerWorkerIdRef.current = null;
    }
    setIsPlaying(false);
    setCurrentBeat(-1);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) stopMetronome();
    else startMetronome();
  }, [isPlaying, startMetronome, stopMetronome]);

  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    const lastTap = tapsRef.current[tapsRef.current.length - 1];
    if (lastTap && now - lastTap > 3000) {
      tapsRef.current = [now];
    } else {
      tapsRef.current.push(now);
    }
    const newBpm = calculateTapTempo(tapsRef.current);
    if (newBpm) {
      setBpm(newBpm);
    }
  }, [setBpm]);

  useEffect(() => {
    return () => {
      if (timerWorkerIdRef.current !== null) {
        clearInterval(timerWorkerIdRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return {
    isPlaying,
    togglePlay,
    currentBeat,
    bpm,
    setBpm,
    timeSignature,
    setTimeSignature,
    beatStates,
    cycleBeatState,
    soundProfile,
    setSoundProfile,
    volume,
    setVolume,
    handleTapTempo,
  };
}
