import React, { useState, useEffect, useRef } from 'react';

export interface BpmHeroProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
}

export const BpmHero: React.FC<BpmHeroProps> = ({ bpm, onBpmChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(bpm.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal edit value with external bpm changes
  useEffect(() => {
    setEditValue(bpm.toString());
  }, [bpm]);

  // Focus and select input on entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitEdit = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(300, Math.max(30, parsed));
      onBpmChange(clamped);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitEdit();
    } else if (e.key === 'Escape') {
      setEditValue(bpm.toString());
      setIsEditing(false);
    }
  };

  const stepBpm = (delta: number) => {
    const next = Math.min(300, Math.max(30, bpm + delta));
    onBpmChange(next);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-1">
      {/* Hero BPM Digits with Zero-Shift Edit Box */}
      <div className="relative flex items-center justify-center h-20 sm:h-24 w-64 mt-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            min="30"
            max="300"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-full text-center text-7xl sm:text-8xl font-mono font-bold tabular-nums text-[var(--text-primary)] bg-[var(--bg-muted)] border-b-2 border-[var(--accent-terracotta)] rounded-xl outline-none py-1 shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Edit BPM value"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="group/btn w-full h-full flex items-center justify-center rounded-xl hover:bg-[var(--bg-muted)]/50 transition-colors focus:outline-none focus-visible:bg-[var(--bg-muted)] cursor-text"
            title="Click to manually edit BPM"
          >
            <span className="text-7xl sm:text-8xl font-mono font-bold tabular-nums tracking-tight text-[var(--text-primary)] leading-none">
              {bpm}
            </span>
          </button>
        )}
      </div>

      {/* BPM Subtitle Label */}
      <span className="text-[11px] font-sans uppercase tracking-[0.25em] font-semibold text-[var(--text-secondary)] mt-2 mb-3 select-none">
        BPM
      </span>

      {/* Stepper Buttons: -5, -1, +1, +5 */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-4 w-full">
        <button
          onClick={() => stepBpm(-5)}
          className="px-3 py-1 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--accent-sand)] active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Decrease by 5 BPM"
          aria-label="Decrease by 5 BPM"
        >
          -5
        </button>
        <button
          onClick={() => stepBpm(-1)}
          className="px-3 py-1 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--accent-sand)] active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Decrease by 1 BPM"
          aria-label="Decrease by 1 BPM"
        >
          -1
        </button>
        <button
          onClick={() => stepBpm(1)}
          className="px-3 py-1 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--accent-sand)] active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Increase by 1 BPM"
          aria-label="Increase by 1 BPM"
        >
          +1
        </button>
        <button
          onClick={() => stepBpm(5)}
          className="px-3 py-1 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--accent-sand)] active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Increase by 5 BPM"
          aria-label="Increase by 5 BPM"
        >
          +5
        </button>
      </div>

      {/* Range Slider */}
      <div className="w-full flex items-center gap-2.5">
        <span className="text-[10px] font-mono tabular-nums text-[var(--text-secondary)] min-w-[18px] text-right">
          30
        </span>
        <input
          type="range"
          min="30"
          max="300"
          step="1"
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
          className="w-full h-1.5 rounded-lg cursor-pointer bg-[var(--bg-muted)] border border-[var(--border-subtle)]"
          aria-label="Tempo BPM slider"
        />
        <span className="text-[10px] font-mono tabular-nums text-[var(--text-secondary)] min-w-[18px]">
          300
        </span>
      </div>
    </div>
  );
};
