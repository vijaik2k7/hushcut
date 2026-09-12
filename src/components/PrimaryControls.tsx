import React from 'react';
import { Play, Square } from 'lucide-react';

export interface PrimaryControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTapTempo: () => void;
  timeSignature: number;
  onTimeSignatureChange: (ts: number) => void;
}

const TIME_SIGNATURE_OPTIONS = [
  { label: '2/4', value: 2 },
  { label: '3/4', value: 3 },
  { label: '4/4', value: 4 },
  { label: '6/8', value: 6 },
];

export const PrimaryControls: React.FC<PrimaryControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onTapTempo,
  timeSignature,
  onTimeSignatureChange,
}) => {
  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto py-1 px-4 gap-3">
      {/* Central Controls: Tap Tempo & Large Play/Stop Button */}
      <div className="flex items-center justify-center gap-5 sm:gap-6">
        {/* Tap Tempo Button */}
        <button
          onClick={onTapTempo}
          className="group relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-sand)] active:scale-90 transition-all duration-100 shadow-sm"
          title="Tap Tempo (Shortcut: T)"
          aria-label="Tap Tempo"
        >
          <span className="font-sans font-bold text-xs tracking-wider uppercase">
            Tap
          </span>
          <span className="text-[9px] font-mono text-[var(--text-secondary)] opacity-70 group-hover:opacity-100">
            [T]
          </span>
        </button>

        {/* Large Play / Pause (Stop) Button */}
        <button
          onClick={onTogglePlay}
          className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full transition-all duration-200 select-none cursor-pointer focus:outline-none ${
            isPlaying
              ? 'bg-[var(--accent-terracotta)] text-white scale-105 active:scale-95'
              : 'bg-[var(--accent-terracotta)] hover:opacity-95 text-white hover:scale-105 active:scale-95'
          }`}
          style={{
            boxShadow: isPlaying
              ? '0 0 0 5px rgba(217, 119, 87, 0.35), 0 8px 20px rgba(217, 119, 87, 0.35)'
              : '0 4px 12px rgba(217, 119, 87, 0.25)',
          }}
          title={isPlaying ? 'Stop Metronome (Space)' : 'Start Metronome (Space)'}
          aria-label={isPlaying ? 'Stop Metronome' : 'Start Metronome'}
        >
          {isPlaying ? (
            <Square className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
          ) : (
            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
          )}
        </button>

        {/* Keyboard Hint Placeholder / Secondary spacer */}
        <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-transparent border border-dashed border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-60">
          <span className="text-[9px] font-mono uppercase">Space</span>
          <span className="text-[8px] font-sans">Play</span>
        </div>
      </div>

      {/* Time Signature Selector Pills */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Time Signature
        </span>
        <div
          className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-subtle)]"
          role="radiogroup"
          aria-label="Time signature selector"
        >
          {TIME_SIGNATURE_OPTIONS.map((opt) => {
            const isSelected = timeSignature === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onTimeSignatureChange(opt.value)}
                role="radio"
                aria-checked={isSelected}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-150 ${
                  isSelected
                    ? 'bg-[var(--accent-terracotta)] text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
