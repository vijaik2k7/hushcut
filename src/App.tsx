import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BpmHero } from './components/BpmHero';
import { BeatMatrix } from './components/BeatMatrix';
import { PrimaryControls } from './components/PrimaryControls';
import { useMetronomeEngine } from './hooks/useMetronomeEngine';
import { getItalianTempoTerm } from './utils/tempoUtils';

export const App: React.FC = () => {
  // Theme state ('dark' | 'light') with local storage and system preference fallback
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('pulse-theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('pulse-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Sync theme class with document root element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Audio & Metronome state hook
  const {
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
  } = useMetronomeEngine();

  // Italian tempo marking (Largo, Moderato, Allegro, etc.)
  const italianTerm = getItalianTempoTerm(bpm);

  // Current beat active state for visualizer
  const currentBeatState =
    currentBeat >= 0 ? beatStates[currentBeat % beatStates.length] || 'normal' : 'normal';

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setBpm(bpm + (e.shiftKey ? 5 : 1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setBpm(bpm - (e.shiftKey ? 5 : 1));
      } else if (e.code === 'KeyT' || e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleTapTempo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, bpm, setBpm, handleTapTempo]);

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Top Header */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        volume={volume}
        onVolumeChange={setVolume}
        soundProfile={soundProfile}
        onSoundProfileChange={setSoundProfile}
        italianTerm={italianTerm}
      />

      {/* Main Metronome Workspace Card with Rectangular Heartbeat Pulse Wave */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0 overflow-hidden relative">
        {/* Heartbeat Pulse Wave Element (Keyed to currentBeat to trigger expanding pulse wave on every tick) */}
        {isPlaying && currentBeat >= 0 && currentBeatState !== 'mute' && (
          <div
            key={currentBeat}
            className={`absolute w-full max-w-lg h-full max-h-[460px] rounded-2xl sm:rounded-3xl border-2 pointer-events-none ${
              currentBeatState === 'accent'
                ? 'animate-box-pulse-accent'
                : 'animate-box-pulse-normal'
            }`}
          />
        )}

        <div
          className="relative z-10 w-full max-w-lg bg-[var(--bg-card)] border rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-between gap-3 max-h-full overflow-y-auto sm:overflow-hidden transition-colors duration-200"
          style={{
            borderColor: !isPlaying || currentBeat < 0
              ? 'var(--border-subtle)'
              : currentBeatState === 'accent'
              ? 'rgba(217, 119, 87, 0.9)'
              : currentBeatState === 'normal'
              ? 'rgba(196, 164, 130, 0.8)'
              : 'var(--border-subtle)',
            boxShadow: !isPlaying || currentBeat < 0
              ? '0 8px 30px rgba(0, 0, 0, 0.12)'
              : currentBeatState === 'accent'
              ? '0 0 35px rgba(217, 119, 87, 0.4), inset 0 0 15px rgba(217, 119, 87, 0.12)'
              : currentBeatState === 'normal'
              ? '0 0 25px rgba(196, 164, 130, 0.3), inset 0 0 10px rgba(196, 164, 130, 0.08)'
              : '0 4px 15px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Top of Card: Starts directly with BPM Hero */}
          <BpmHero bpm={bpm} onBpmChange={setBpm} />

          {/* Middle: Beat Accent Pattern Track (1, 2, 3, 4) */}
          <BeatMatrix
            beatStates={beatStates}
            currentBeat={currentBeat}
            onCycleBeat={cycleBeatState}
          />

          {/* Bottom: Primary Play/Stop & Time Signature Controls */}
          <PrimaryControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onTapTempo={handleTapTempo}
            timeSignature={timeSignature}
            onTimeSignatureChange={setTimeSignature}
          />
        </div>
      </main>

      {/* Footer with keyboard shortcut hint badges */}
      <footer className="w-full py-4 px-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50 backdrop-blur-sm transition-colors duration-200">
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="font-medium text-[var(--text-primary)]/80 text-[11px] uppercase tracking-wider">
              Shortcuts:
            </span>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)] font-mono text-[11px]">
              <kbd className="font-semibold text-[var(--text-primary)]">[Space]</kbd>
              <span>Play/Stop</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)] font-mono text-[11px]">
              <kbd className="font-semibold text-[var(--text-primary)]">[↑/↓]</kbd>
              <span>±BPM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-muted)] border border-[var(--border-subtle)] font-mono text-[11px]">
              <kbd className="font-semibold text-[var(--text-primary)]">[T]</kbd>
              <span>Tap</span>
            </div>
          </div>
          <span className="font-serif italic text-[11px] opacity-75">
            Pulse Metronome • Precision Lookahead Audio
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
