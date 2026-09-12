# Pulse Metronome 🎵

> A clean, modern, and sample-accurate online metronome designed with **Anthropic's warm minimalist aesthetics** and powered by a high-precision **Web Audio API lookahead scheduler**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-D97757?style=for-the-badge&logo=github)](https://vijaik2k7.github.io/pulse-metronome/)
[![License: MIT](https://img.shields.io/badge/License-MIT-C4A482.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

---

## ✨ Features

- ⏱️ **Zero-Drift Web Audio Scheduler**: Decouples audio scheduling from main-thread rendering using `AudioContext.currentTime` lookahead windows (100ms window / 25ms timer interval), guaranteeing sample-accurate timing even during heavy CPU load or background tab execution.
- 🎨 **Anthropic Design Language**: Warm Cream Light (`#FAF9F6`) and Obsidian Dark (`#141413`) theme modes, crafted with tabular monospace numerals (`font-mono tabular-nums`) to prevent layout shifts.
- 💓 **Heartbeat Edge Glow**: Animated rectangular pulse wave that expands outward from the box border on every beat tick (*Terracotta downbeats / Sandstone normal beats*).
- 🥁 **Tactile Beat Accent Matrix**: Clickable beat cards for custom rhythm emphasis (cycle between **Accent** → **Normal** → **Mute** per beat).
- 🔊 **3 Synthesized Sound Profiles**: Pure native Web Audio API oscillators (no external mp3/wav files):
  - **Woodblock**: Pitch-bending sine waves with snappy exponential decay.
  - **Mechanical Click**: High-frequency pulses with noise transients.
  - **Warm Synth**: Pure sine waves with smooth attack/decay envelopes.
- 👆 **Tap Tempo & Italian Terms**: Tap tempo button calculating rolling averages over consecutive taps, with dynamic Italian tempo markings (*Largo*, *Adagio*, *Andante*, *Moderato*, *Allegro*, *Presto*, *Prestissimo*).
- ⌨️ **Ergonomic Keyboard Shortcuts**:
  - `[Spacebar]`: Toggle Play / Stop
  - `[Up / Down Arrow]`: Adjust BPM ±1 (`Shift + Arrow`: ±5 BPM)
  - `[T]`: Tap Tempo trigger

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0 or higher
- npm v9.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/vijaik2k7/pulse-metronome.git

# Navigate into project directory
cd pulse-metronome

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🧪 Testing & Build

```bash
# Run unit tests (Vitest)
npx vitest run

# Run TypeScript type check & production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📐 Architecture Overview

```
                               ┌──────────────────────────────────┐
                               │     AudioContext.currentTime     │
                               └────────────────┬─────────────────┘
                                                │
┌───────────────────────────┐                   │                   ┌───────────────────────────┐
│   Lookahead Scheduler     │───────────────────┼──────────────────>│   Audio Node Synthesizer  │
│   (Interval: ~25ms)       │   Schedules nodes │                   │   (Woodblock/Mech/Synth)  │
│   Schedule Window: 100ms  │   at exact time   │                   └───────────────────────────┘
└─────────────┬─────────────┘                   │
              │                                 │
              ▼                                 ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│   Visual Beat Pulse State │       │   React UI Components     │
│   (Sync'd with Web Audio) │──────>│   (BPM Hero, Beat Matrix) │
└───────────────────────────┘       └───────────────────────────┘
```

---

## 🌐 Deployment

### GitHub Pages (Automated Workflow)
This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`). On every push to `main`, the app automatically builds and deploys to GitHub Pages at:  
`https://vijaik2k7.github.io/pulse-metronome/`

### Vercel Deployment
Deploy instantly to Vercel:
```bash
npx vercel --prod
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
