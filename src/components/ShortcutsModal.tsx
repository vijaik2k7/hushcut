import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { ThemeMode } from '../types/audio';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const shortcuts = [
    { key: 'Space', description: 'Play / Pause audio playback' },
    { key: 'Delete / Backspace', description: 'Slice & delete currently selected range' },
    { key: 'Ctrl + Z / Cmd + Z', description: 'Undo last edit' },
    { key: 'Ctrl + Y / Cmd + Shift + Z', description: 'Redo undone edit' },
    { key: 'Escape', description: 'Clear active range selection' },
    { key: 'Cmd + V / Ctrl + V', description: 'Paste video/audio file directly from clipboard' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md border rounded-2xl p-6 shadow-2xl space-y-4 ${
          isDark ? 'bg-[#0c0c0e] border-zinc-800' : 'bg-[#eee8dd] border-[#d8cfbe]'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-zinc-800' : 'border-[#d8cfbe]'}`}>
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-[#FF5500]" />
            <h2 className={`font-mono text-base font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-stone-600 hover:text-stone-900 hover:bg-[#e4ddd0]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut Items */}
        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between border px-3 py-2 rounded-xl text-xs font-mono ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800/80 text-zinc-300'
                  : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-900 shadow-sm'
              }`}
            >
              <span>{s.description}</span>
              <kbd
                className={`font-bold px-2 py-1 rounded-md text-[11px] border shadow-sm ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-[#FF5500]'
                    : 'bg-[#e4ddd0] border-[#c7bcaa] text-[#FF5500]'
                }`}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`pt-2 text-center font-mono text-xs ${isDark ? 'text-zinc-500' : 'text-stone-600'}`}>
          Press <kbd className="font-bold">Esc</kbd> or click outside to close
        </div>
      </div>
    </div>
  );
};
