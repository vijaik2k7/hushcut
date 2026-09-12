import React from 'react';
import { BeatType } from '../services/audioSynthesizer';

export interface MetronomeVisualizerProps {
  isPlaying: boolean;
  currentBeat: number;
  beatState: BeatType;
}

export const MetronomeVisualizer: React.FC<MetronomeVisualizerProps> = ({
  isPlaying,
  currentBeat,
  beatState,
}) => {
  const isAccent = beatState === 'accent';
  const isMute = beatState === 'mute';
  const isTicking = isPlaying && currentBeat >= 0;

  // Glow and border colors depending on beat type
  const getGlowColor = () => {
    if (!isTicking || isMute) return 'transparent';
    return isAccent
      ? 'rgba(217, 119, 87, 0.35)' // terracotta glow
      : 'rgba(196, 164, 130, 0.28)'; // sandstone glow
  };

  const getBorderColor = () => {
    if (!isTicking) return 'var(--border-subtle)';
    if (isMute) return 'var(--border-subtle)';
    return isAccent ? 'var(--accent-terracotta)' : 'var(--accent-sand)';
  };

  const getOrbBg = () => {
    if (!isTicking) return 'var(--bg-card)';
    if (isMute) return 'var(--bg-muted)';
    return isAccent
      ? 'var(--accent-terracotta)'
      : 'var(--accent-sand)';
  };

  const getTextColor = () => {
    if (!isTicking || isMute) return 'var(--text-secondary)';
    return '#FFFFFF';
  };

  return (
    <div className="relative flex items-center justify-center py-2 sm:py-3 select-none">
      {/* Outer ambient halo */}
      <div
        className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
          isTicking && !isMute ? 'opacity-100 scale-105' : 'opacity-20 scale-95'
        }`}
        style={{
          width: '160px',
          height: '160px',
          background: isTicking && !isMute
            ? `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`
            : 'transparent',
          boxShadow: isTicking && !isMute ? `0 0 35px ${getGlowColor()}` : 'none',
        }}
      />

      {/* Ripple ring animation (keyed to currentBeat to re-trigger pulse) */}
      <div
        key={currentBeat}
        className={`absolute rounded-full border transition-transform pointer-events-none ${
          isTicking && !isMute ? (isAccent ? 'animate-ring-pulse' : 'scale-100 opacity-70') : 'opacity-30 scale-95'
        }`}
        style={{
          width: '135px',
          height: '135px',
          borderColor: getBorderColor(),
          boxShadow: isTicking && !isMute ? `0 0 20px ${getGlowColor()}` : 'none',
        }}
      />

      {/* Secondary concentric inner ring */}
      <div
        className="absolute rounded-full border border-[var(--border-subtle)] pointer-events-none transition-all duration-200"
        style={{
          width: '110px',
          height: '110px',
          borderColor: isTicking ? getBorderColor() : 'var(--border-subtle)',
          opacity: isTicking ? 0.8 : 0.4,
        }}
      />

      {/* Central Core Orb */}
      <div
        className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center transition-all duration-150 border-2 shadow-sm"
        style={{
          backgroundColor: getOrbBg(),
          borderColor: getBorderColor(),
          color: getTextColor(),
          transform: isTicking && !isMute ? 'scale(1.04)' : 'scale(1)',
          boxShadow: isTicking && !isMute
            ? `0 4px 16px ${getGlowColor()}`
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        {isTicking ? (
          <>
            <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none">
              {currentBeat + 1}
            </span>
            <span
              className="text-[9px] uppercase font-sans tracking-widest mt-0.5 opacity-90 font-medium"
            >
              {isAccent ? 'Accent' : isMute ? 'Muted' : 'Beat'}
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-[var(--accent-terracotta)]/60 mb-1" />
            <span className="text-[11px] font-serif italic text-[var(--text-secondary)]">
              Ready
            </span>
          </>
        )}
      </div>
    </div>
  );
};
