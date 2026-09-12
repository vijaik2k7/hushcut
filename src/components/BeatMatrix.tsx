import React from 'react';
import { BeatType } from '../services/audioSynthesizer';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export interface BeatMatrixProps {
  beatStates: BeatType[];
  currentBeat: number;
  onCycleBeat: (index: number) => void;
}

export const BeatMatrix: React.FC<BeatMatrixProps> = ({
  beatStates,
  currentBeat,
  onCycleBeat,
}) => {
  return (
    <div className="flex flex-col items-center py-2 w-full max-w-md mx-auto">
      {/* Label & Header */}
      <div className="flex items-center justify-between w-full px-2 mb-2.5">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Beat Accent Pattern
        </span>
        <span className="text-[10px] font-sans text-[var(--text-secondary)]/80">
          Click beat to cycle state
        </span>
      </div>

      {/* Tactile Beat Cards Container */}
      <div
        className="flex items-center justify-center gap-2.5 sm:gap-3 w-full p-2.5 rounded-2xl bg-[var(--bg-muted)]/50 border border-[var(--border-subtle)] transition-colors"
        role="group"
        aria-label="Beat pattern matrix"
      >
        {beatStates.map((state, index) => {
          const isCurrent = currentBeat === index;
          const isAccent = state === 'accent';
          const isNormal = state === 'normal';
          const isMute = state === 'mute';

          return (
            <button
              key={index}
              onClick={() => onCycleBeat(index)}
              className={`relative flex-1 max-w-[72px] h-20 sm:h-22 rounded-xl flex flex-col items-center justify-between py-2 px-1 transition-all duration-150 select-none cursor-pointer focus:outline-none ${
                isCurrent
                  ? 'scale-105 z-10'
                  : 'hover:scale-[1.02] active:scale-95'
              } ${
                isAccent
                  ? 'bg-[var(--accent-terracotta)] text-white shadow-md shadow-[var(--accent-terracotta)]/25 border border-[var(--accent-terracotta)]'
                  : isNormal
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-sm hover:border-[var(--accent-sand)]'
                  : 'bg-[var(--bg-card)]/40 text-[var(--text-secondary)]/40 border border-dashed border-[var(--border-subtle)]'
              }`}
              style={{
                boxShadow: isCurrent
                  ? isAccent
                    ? '0 0 0 3px rgba(217, 119, 87, 0.4), 0 6px 16px rgba(217, 119, 87, 0.3)'
                    : isNormal
                    ? '0 0 0 3px rgba(196, 164, 130, 0.4), 0 4px 12px rgba(196, 164, 130, 0.2)'
                    : '0 0 0 2px var(--border-subtle)'
                  : undefined,
              }}
              title={`Beat ${index + 1}: ${state.toUpperCase()}. Click to cycle (Accent → Normal → Mute).`}
              aria-label={`Beat ${index + 1} is ${state}. Click to cycle.`}
            >
              {/* Top Accent State Indicator Pill/Icon */}
              <div className="flex items-center justify-center h-4">
                {isAccent ? (
                  <span className="flex items-center gap-1 text-[9px] font-sans font-bold tracking-wider uppercase text-white/90">
                    <Sparkles className="w-2.5 h-2.5 fill-current" />
                    ACCENT
                  </span>
                ) : isNormal ? (
                  <span className="flex items-center gap-1 text-[9px] font-sans font-semibold tracking-wider uppercase text-[var(--accent-sand)]">
                    <Volume2 className="w-2.5 h-2.5" />
                    NORM
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] font-sans font-medium tracking-wider uppercase text-[var(--text-secondary)]/40">
                    <VolumeX className="w-2.5 h-2.5" />
                    MUTE
                  </span>
                )}
              </div>

              {/* Beat Number */}
              <span
                className={`font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none ${
                  isAccent
                    ? 'text-white'
                    : isNormal
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]/40'
                }`}
              >
                {index + 1}
              </span>

              {/* Bottom State Bar Indicator */}
              <div className="w-full px-2">
                <div
                  className={`w-full h-1 rounded-full ${
                    isAccent
                      ? 'bg-white/80'
                      : isNormal
                      ? 'bg-[var(--accent-sand)]'
                      : 'bg-[var(--border-subtle)]'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
