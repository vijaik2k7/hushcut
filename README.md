# HushCut ✂️

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-FF5500?style=for-the-badge&logo=github)](https://vijaik2k7.github.io/hushcut/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

> **Extract audio. Cut the dead air.**
> A single-page, 100% client-side web application for audio extraction, automated silence detection, dead air ripple trimming, and export to WAV/MP3.

---

## ✨ Features

- 🔊 **Audio Extraction**: Drag and drop video (`.mp4`, `.mov`, `.webm`, `.mkv`) or audio (`.mp3`, `.wav`, `.m4a`, `.aac`) files to extract the audio track in seconds.
- 🔇 **Dead Air Ripple Trimming**: RMS decibel thresholding auto-detects silent pauses and removes them in 1 click with word-edge safety padding.
- 📊 **Interactive Waveform Viewport**: HTML5 canvas rendering with 1x to 10x zooming, scrubbable playhead, timecode ruler (`MM:SS.ms`), and range selection handles.
- 💾 **WAV & MP3 Export Engine**: Export lossless 16-bit PCM WAV or MP3 files with bitrate presets (128kbps, 192kbps, 256kbps, 320kbps).
- 🔒 **100% Local Privacy**: All media processing runs directly inside Web Audio API memory—zero files uploaded to any server.
- 🌗 **Dark & Soothing Beige Themes**: Clean theme toggle with automatic `localStorage` persistence.
- ⌨️ **Keyboard Shortcuts**: `Space` (Play/Pause), `Delete` (Slice selection), `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), `Cmd+V` (Paste file from clipboard).

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Audio Engine**: Web Audio API (`AudioContext`, `AudioBuffer`)
- **Audio Encoders**: Pure JS 16-bit PCM WAV Encoder & Client-Side MP3 Encoder (`lamejs`)
- **Icons**: Lucide React

---

## 🚀 Quick Start (Local Development)

```bash
# Clone repository
git clone https://github.com/vijaik2k7/hushcut.git
cd hushcut

# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📜 License

MIT © [Vijai](https://github.com/vijaik2k7)
