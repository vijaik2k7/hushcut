# Pulse Metronome - Design Specification

**Date**: 2026-09-12  
**Status**: Approved  
**Author**: Product & Design Engineering (Anthropic Aesthetic Style)

---

## 1. Executive Summary & Product Goal

**Pulse Metronome** is a clean, modern, and stylish web metronome application built with high timing accuracy and Anthropic-inspired aesthetic elegance. It combines warm minimalist visual design with a sample-accurate Web Audio API lookahead scheduler to ensure zero-drift tempo management for musicians and producers.

---

## 2. Design System & Aesthetics

### 2.1 Color Palette & Theme Tokens

The UI supports both **Warm Light** (default Anthropic cream) and **Obsidian Dark** themes.

| Token | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| `--bg-app` | `#FAF9F6` | `#141413` | Main canvas background |
| `--bg-card` | `#F3F0E9` | `#1E1E1C` | Elevated containers & cards |
| `--bg-muted` | `#E8E4DA` | `#282825` | Input tracks & inactive pills |
| `--text-primary` | `#1F1E1B` | `#EDECE8` | Primary text & BPM display |
| `--text-secondary` | `#706E6B` | `#A09E9A` | Subtitles & Italian terms |
| `--accent-terracotta`| `#D97757` | `#E07A5F` | Primary action & Downbeat flash |
| `--accent-sand` | `#C4A482` | `#8C7762` | Normal beat pulse |
| `--border-subtle` | `#E6E2D8` | `#2A2A27` | Subtle divider lines |

### 2.2 Typography & Numerals
- **Header Title**: Serif font (`Instrument Serif` or system serif font family).
- **Control Labels**: Sans-serif (`Inter`, `system-ui`).
- **BPM Numerals**: Monospace tabular numerals (`font-mono tabular-nums`) to prevent layout shifts.

### 2.3 Visualizer Design
- **Pulsing Ring Visualizer**: Concentric circular ring surrounding the central BPM display.
- **Beat Animation**: On beat 1 (downbeat), the ring expands with a Terracotta glow. On sub-beats, it emits a subtle sandstone pulse.
- **Beat Matrix**: Horizontal bar of interactive pills showing beat states (**Accent**, **Normal**, **Mute**).

---

## 3. Architecture & Audio Engine

### 3.1 Sample-Accurate Lookahead Scheduler

To overcome JavaScript main-thread event loop latency and timer throttling when tabs are unfocused, audio scheduling is decoupled from rendering using Web Audio API's `AudioContext.currentTime`.

```
                  ┌────────────────────────────────────────┐
                  │          AudioContext.currentTime       │
                  └──────────────────┬─────────────────────┘
                                     │
┌─────────────────────────┐          │          ┌─────────────────────────┐
│  High-Precision Loop    │──────────┼─────────>│ Audio Node Synthesis    │
│  (Interval: ~25ms)      │  Schedules nodes    │ (Sine, Pitch Bend, Env) │
│  Schedule window: 100ms │  at precise time    └─────────────────────────┘
└─────────────────────────┘
```

- `lookahead`: 25 milliseconds.
- `scheduleAheadTime`: 0.1 seconds (100 ms ahead of real-time).
- Next beat time calculation: `nextBeatTime += 60.0 / currentBpm`.

### 3.2 Sound Synthesis Profiles

All sound clicks are synthesized natively in Web Audio API without external audio file dependencies.

1. **Woodblock**:
   - Downbeat: Sine oscillator @ 800Hz, rapid frequency drop to 300Hz in 15ms, exponential gain decay over 45ms.
   - Normal Beat: Sine oscillator @ 600Hz, rapid pitch drop to 200Hz, 35ms decay.
2. **Mechanical Click**:
   - Downbeat: High-frequency burst (1600Hz) with 5ms impulse envelope + short high-pass noise burst.
   - Normal Beat: 1200Hz impulse with 4ms envelope.
3. **Warm Synth**:
   - Downbeat: Pure sine @ 880Hz (A5), 5ms attack, 60ms release.
   - Normal Beat: Pure sine @ 440Hz (A4), 5ms attack, 40ms release.

---

## 4. UI Components & Functionality

### 4.1 Component Structure

- `App.tsx`: Main container, theme state, layout wrapper.
- `Header.tsx`: Title logo, Italian tempo term badge, volume control, sound profile selector, light/dark theme toggle.
- `MetronomeVisualizer.tsx`: Concentric pulsing ring visualizer with animated scale & glow synchronized with the current beat.
- `BpmHero.tsx`: Main BPM number, direct BPM text input, quick step buttons (`-5`, `-1`, `+1`, `+5`), and smooth BPM range slider.
- `BeatMatrix.tsx`: Interactive row of beat pills for the active time signature. Clicking cycles beat type (Accent → Normal → Mute).
- `PrimaryControls.tsx`: Large play/stop button, Tap Tempo button, and time signature picker (`2/4`, `3/4`, `4/4`, `6/8`).
- `hooks/useMetronomeEngine.ts`: Core state management and Web Audio API scheduler hook.

### 4.2 Italian Tempo Term Mapping

- `30 - 59 BPM`: *Largo* (Broad, slow)
- `60 - 75 BPM`: *Adagio* (Slow and stately)
- `76 - 107 BPM`: *Andante* (Walking pace)
- `108 - 119 BPM`: *Moderato* (Moderate)
- `120 - 155 BPM`: *Allegro* (Fast, bright)
- `156 - 199 BPM`: *Presto* (Very fast)
- `200+ BPM`: *Prestissimo* (Extremely fast)

### 4.3 Keyboard Shortcuts

- `Spacebar`: Toggle Start / Stop metronome.
- `ArrowUp` / `ArrowDown`: Adjust BPM ±1 (`Shift + Arrow`: ±5 BPM).
- `KeyT`: Tap Tempo button trigger.

---

## 5. Verification & Testing Strategy

1. **Audio Engine Verification**:
   - Verify zero timing drift at extreme tempos (30 BPM & 300 BPM).
   - Test background tab execution for audio stability.
2. **Interactive UI Verification**:
   - Test Beat Matrix state cycling (Accent → Normal → Mute).
   - Test Tap Tempo rolling average accuracy over multiple taps.
   - Verify keyboard shortcut responses and theme toggling.
3. **Responsiveness & Design Fidelity**:
   - Verify crisp layout rendering on both desktop and mobile viewports.
