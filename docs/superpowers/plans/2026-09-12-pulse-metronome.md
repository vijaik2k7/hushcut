# Pulse Metronome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Pulse Metronome, a stylish, highly-accurate web metronome application designed with Anthropic's warm minimalist aesthetic and Web Audio API precision scheduling.

**Architecture:** Web Audio API lookahead scheduler (`AudioContext.currentTime`) decoupled from React rendering cycles to prevent JS main thread timer drift. React components styled with Tailwind CSS supporting Warm Cream (Light) and Obsidian Dark themes.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React icons, Vite, Vitest for unit testing.

## Global Constraints

- **Theme Palettes**: Light (`#FAF9F6` bg, `#F3F0E9` card, `#D97757` accent) / Dark (`#141413` bg, `#1E1E1C` card, `#E07A5F` accent).
- **Numerals**: Monospace tabular numbers (`font-mono tabular-nums`) for BPM.
- **Audio**: Pure native Web Audio API oscillators (no external mp3/wav files).
- **Tempo Limits**: 30 to 300 BPM.

---

### Task 1: Tempo & Italian Term Utilities (`src/utils/tempoUtils.ts`)

**Files:**
- Create: `src/utils/tempoUtils.ts`
- Create: `src/utils/tempoUtils.test.ts`

**Interfaces:**
- Produces: `getItalianTempoTerm(bpm: number): string`, `calculateTapTempo(taps: number[]): number | null`

- [x] **Step 1: Write the failing unit tests for tempo utilities**

Create `src/utils/tempoUtils.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getItalianTempoTerm, calculateTapTempo } from './tempoUtils';

describe('tempoUtils', () => {
  it('returns correct Italian tempo terms based on BPM', () => {
    expect(getItalianTempoTerm(45)).toBe('Largo');
    expect(getItalianTempoTerm(70)).toBe('Adagio');
    expect(getItalianTempoTerm(90)).toBe('Andante');
    expect(getItalianTempoTerm(112)).toBe('Moderato');
    expect(getItalianTempoTerm(135)).toBe('Allegro');
    expect(getItalianTempoTerm(180)).toBe('Presto');
    expect(getItalianTempoTerm(220)).toBe('Prestissimo');
  });

  it('calculates tap tempo average correctly from tap timestamps in ms', () => {
    // 500ms intervals = 120 BPM
    const taps = [1000, 1500, 2000, 2500];
    expect(calculateTapTempo(taps)).toBe(120);
  });

  it('handles empty or single tap gracefully', () => {
    expect(calculateTapTempo([])).toBeNull();
    expect(calculateTapTempo([1000])).toBeNull();
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/tempoUtils.test.ts`
Expected: FAIL with "Cannot find module ./tempoUtils"

- [x] **Step 3: Implement `src/utils/tempoUtils.ts`**

Create `src/utils/tempoUtils.ts`:
```ts
export function getItalianTempoTerm(bpm: number): string {
  if (bpm < 60) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 156) return 'Allegro';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo';
}

export function calculateTapTempo(taps: number[]): number | null {
  if (taps.length < 2) return null;
  // Consider up to the last 5 taps
  const recentTaps = taps.slice(-5);
  const intervals: number[] = [];
  
  for (let i = 1; i < recentTaps.length; i++) {
    intervals.push(recentTaps[i] - recentTaps[i - 1]);
  }
  
  const averageIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (averageIntervalMs <= 0) return null;
  
  const rawBpm = Math.round(60000 / averageIntervalMs);
  // Clamp between 30 and 300
  return Math.min(300, Math.max(30, rawBpm));
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/tempoUtils.test.ts`
Expected: PASS

- [x] **Step 5: Commit task output**

Run: `git add src/utils/tempoUtils.ts src/utils/tempoUtils.test.ts`

---

### Task 2: Audio Synthesis Engine & Custom Hook (`src/hooks/useMetronomeEngine.ts`)

**Files:**
- Create: `src/hooks/useMetronomeEngine.ts`
- Create: `src/services/audioSynthesizer.ts`

**Interfaces:**
- Produces: `useMetronomeEngine(config)` returning `{ isPlaying, togglePlay, currentBeat, bpm, setBpm, timeSignature, setTimeSignature, beatsState, setBeatState, soundProfile, setSoundProfile, volume, setVolume, tapTempo }`

- [x] **Step 1: Create Audio Synthesizer service (`src/services/audioSynthesizer.ts`)**

```ts
export type SoundProfile = 'woodblock' | 'mechanical' | 'synth';
export type BeatType = 'accent' | 'normal' | 'mute';

export function playTick(
  audioCtx: AudioContext,
  time: number,
  type: BeatType,
  profile: SoundProfile,
  volume: number
) {
  if (type === 'mute' || volume <= 0) return;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(volume * (type === 'accent' ? 1.0 : 0.7), time);
  masterGain.connect(audioCtx.destination);

  if (profile === 'woodblock') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const startFreq = type === 'accent' ? 800 : 600;
    const endFreq = type === 'accent' ? 300 : 200;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.015);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (type === 'accent' ? 0.045 : 0.035));

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.05);
  } else if (profile === 'mechanical') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = type === 'accent' ? 1600 : 1200;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.02);
  } else {
    // Warm Synth
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = type === 'accent' ? 880 : 440;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(1, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (type === 'accent' ? 0.06 : 0.04));

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.07);
  }
}
```

- [x] **Step 2: Create precision metronome hook (`src/hooks/useMetronomeEngine.ts`)**

```ts
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

  // Keep refs in sync for scheduler loop callbacks
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  const beatStatesRef = useRef(beatStates);
  beatStatesRef.current = beatStates;
  const soundProfileRef = useRef(soundProfile);
  soundProfileRef.current = soundProfile;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Auto-adjust beatStates when timeSignature changes
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
    const scheduleAheadTime = 0.1; // 100ms
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + scheduleAheadTime) {
      const beatIdx = currentBeatRef.current;
      const bStates = beatStatesRef.current;
      const beatType = bStates[beatIdx % bStates.length] || 'normal';

      // Schedule sound
      playTick(audioCtxRef.current, nextNoteTimeRef.current, beatType, soundProfileRef.current, volumeRef.current);

      // Trigger UI pulse state synchronized with current beat time
      const delayMs = Math.max(0, (nextNoteTimeRef.current - audioCtxRef.current.currentTime) * 1000);
      const activeBeat = beatIdx % bStates.length;
      setTimeout(() => {
        setCurrentBeat(activeBeat);
      }, delayMs);

      // Advance beat
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
    // Reset if taps are more than 3 seconds apart
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
```

---

### Task 3: Theme Configuration & Design Styling (`src/index.css` & Tailwind)

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`

- [x] **Step 1: Add custom CSS variable theme definitions in `src/index.css`**

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@layer base {
  :root {
    --bg-app: #FAF9F6;
    --bg-card: #F3F0E9;
    --bg-muted: #E8E4DA;
    --text-primary: #1F1E1B;
    --text-secondary: #706E6B;
    --accent-terracotta: #D97757;
    --accent-sand: #C4A482;
    --border-subtle: #E6E2D8;
  }

  .dark {
    --bg-app: #141413;
    --bg-card: #1E1E1C;
    --bg-muted: #282825;
    --text-primary: #EDECE8;
    --text-secondary: #A09E9A;
    --accent-terracotta: #E07A5F;
    --accent-sand: #8C7762;
    --border-subtle: #2A2A27;
  }

  body {
    background-color: var(--bg-app);
    color: var(--text-primary);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
}

/* Custom pulsing animation for Downbeat */
@keyframes ring-pulse {
  0% {
    transform: scale(0.96);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
  100% {
    transform: scale(0.96);
    opacity: 0.4;
  }
}

.animate-ring-pulse {
  animation: ring-pulse 0.4s ease-out;
}
```

---

### Task 4: UI Components Construction

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/MetronomeVisualizer.tsx`
- Create: `src/components/BpmHero.tsx`
- Create: `src/components/BeatMatrix.tsx`
- Create: `src/components/PrimaryControls.tsx`

- [x] **Step 1: Implement `src/components/Header.tsx`**

Header component with logo, Italian term badge, volume control, sound profile dropdown, and theme toggle button.

- [x] **Step 2: Implement `src/components/MetronomeVisualizer.tsx`**

Hero concentric pulsing ring component with beat-synchronized visual feedback.

- [x] **Step 3: Implement `src/components/BpmHero.tsx`**

BPM display with monospace tabular numbers, steppers (-5, -1, +1, +5), and range slider.

- [x] **Step 4: Implement `src/components/BeatMatrix.tsx`**

Row of interactive beat dots cycling Accent → Normal → Mute on click.

- [x] **Step 5: Implement `src/components/PrimaryControls.tsx`**

Large Play/Stop toggle button, Tap Tempo button, and time signature selector pills.

---

### Task 5: App Integration & Keyboard Shortcuts (`src/App.tsx`)

**Files:**
- Modify: `src/App.tsx`

- [x] **Step 1: Assemble full application and attach global window keydown listener**

```tsx
// Keydown handlers for Spacebar (Play/Pause), Up/Down (BPM ±1 / ±5), and 'T' (Tap Tempo)
```

- [x] **Step 2: Run dev server & verify visual appearance**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

---

## Verification Plan

### Automated Tests
- `npx vitest run`: Ensures tempo utilities and calculation formulas pass.
- `npm run build`: Validates TypeScript compile safety and bundle integrity.

### Manual Verification
- **Play/Stop**: Click play button or press `Spacebar` to confirm sound ticks.
- **Beat Accent Matrix**: Click beats 1..N to change accent colors (Terracotta accent vs Sandstone normal vs Translucent muted).
- **Tap Tempo**: Tap the 'T' button or press key `T` four times to calculate BPM.
- **Theme Toggle**: Switch between Anthropic Warm Cream (Light) and Obsidian (Dark).
