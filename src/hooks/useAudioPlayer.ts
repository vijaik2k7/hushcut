import { useState, useRef, useEffect, useCallback } from 'react';
import { getAudioContext } from '../services/audioEngine';

export function useAudioPlayer(audioBuffer: AudioBuffer | null) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const startOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Stop playback cleanly
  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.onended = null;
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (_) {
        // Node might already be stopped
      }
      sourceNodeRef.current = null;
    }
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Update current time during playback
  const updateProgress = useCallback(() => {
    if (!isPlaying || !audioBuffer) return;

    const audioCtx = getAudioContext();
    const elapsed = audioCtx.currentTime - startTimeRef.current;
    const computedTime = startOffsetRef.current + elapsed;

    if (computedTime >= audioBuffer.duration) {
      setCurrentTime(audioBuffer.duration);
      stopPlayback();
    } else {
      setCurrentTime(computedTime);
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, audioBuffer, stopPlayback]);

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(updateProgress);
    } else if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, updateProgress]);

  // Start playback from target offset
  const playFrom = useCallback(
    (offsetInSeconds: number) => {
      if (!audioBuffer) return;

      stopPlayback();

      const audioCtx = getAudioContext();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const clampedOffset = Math.max(0, Math.min(audioBuffer.duration - 0.01, offsetInSeconds));

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      source.onended = () => {
        setIsPlaying(false);
      };

      startTimeRef.current = audioCtx.currentTime;
      startOffsetRef.current = clampedOffset;
      setCurrentTime(clampedOffset);

      source.start(0, clampedOffset);
      sourceNodeRef.current = source;
      setIsPlaying(true);
    },
    [audioBuffer, stopPlayback]
  );

  // Toggle Play / Pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playFrom(currentTime >= (audioBuffer?.duration || 0) ? 0 : currentTime);
    }
  }, [isPlaying, audioBuffer, currentTime, playFrom, stopPlayback]);

  // Seek playhead
  const seekTo = useCallback(
    (timeInSeconds: number) => {
      const clamped = Math.max(0, Math.min(audioBuffer?.duration || 0, timeInSeconds));
      setCurrentTime(clamped);
      if (isPlaying) {
        playFrom(clamped);
      }
    },
    [audioBuffer, isPlaying, playFrom]
  );

  // Reset when audioBuffer changes
  useEffect(() => {
    stopPlayback();
    setCurrentTime(0);
  }, [audioBuffer, stopPlayback]);

  return {
    isPlaying,
    currentTime,
    togglePlayPause,
    seekTo,
    stopPlayback,
  };
}
