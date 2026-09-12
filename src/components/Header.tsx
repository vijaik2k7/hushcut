import React from 'react';
import { Sun, Moon, Volume2, VolumeX, Activity } from 'lucide-react';
import { SoundProfile } from '../services/audioSynthesizer';

export interface HeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
  volume?: number;
  onVolumeChange?: (vol: number) => void;
  soundProfile?: SoundProfile;
  onSoundProfileChange?: (sp: SoundProfile) => void;
  italianTerm?: string;
  // Backward compatibility with legacy App.tsx before Task 5
  metadata?: unknown;
  onReset?: () => void;
  onOpenShortcuts?: () => void;
  theme?: unknown;
}

export const Header: React.FC<HeaderProps> = ({
  isDark = false,
  onToggleTheme = () => {},
  volume = 0.8,
  onVolumeChange = () => {},
  soundProfile = 'woodblock',
  onSoundProfileChange = () => {},
  italianTerm = 'Moderato',
}) => {
  return (
    <header className="w-full border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-2.5 sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Italian Term */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-terracotta)]/15 flex items-center justify-center text-[var(--accent-terracotta)] shadow-sm">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Pulse Metronome
            </h1>
            {italianTerm && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-serif italic text-[var(--text-secondary)] bg-[var(--bg-muted)] border border-[var(--border-subtle)]">
                {italianTerm}
              </span>
            )}
          </div>
        </div>

        {/* Right Controls: Sound profile, Volume, Theme toggle */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Sound Profile Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="sound-profile-select" className="sr-only">
              Sound Profile
            </label>
            <select
              id="sound-profile-select"
              value={soundProfile}
              onChange={(e) => onSoundProfileChange(e.target.value as SoundProfile)}
              className="text-xs font-sans font-medium px-2.5 py-1.5 rounded-lg bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--accent-terracotta)] cursor-pointer transition-all hover:border-[var(--accent-sand)]"
            >
              <option value="woodblock">Woodblock</option>
              <option value="mechanical">Mechanical</option>
              <option value="synth">Warm Synth</option>
            </select>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 bg-[var(--bg-muted)]/70 px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
            <button
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.8)}
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title={volume > 0 ? 'Mute' : 'Unmute'}
              aria-label={volume > 0 ? 'Mute' : 'Unmute'}
            >
              {volume > 0 ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 sm:w-20 h-1.5 rounded-lg appearance-none cursor-pointer bg-[var(--border-subtle)]"
              aria-label="Volume slider"
            />
            <span className="text-[10px] font-mono tabular-nums text-[var(--text-secondary)] min-w-[28px]">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-[var(--bg-muted)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-all"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle color theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
