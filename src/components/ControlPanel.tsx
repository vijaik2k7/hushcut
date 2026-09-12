import React from 'react';
import { SilenceConfig, AudioSelection, ThemeMode } from '../types/audio';
import { Flame, Trash2, Crop, Undo2, Redo2, Sliders, Sparkles, X } from 'lucide-react';

interface ControlPanelProps {
  config: SilenceConfig;
  onChangeConfig: (newConfig: SilenceConfig) => void;
  onDetectSilence: () => void;
  onNukeSilence: () => void;
  silenceCount: number;
  totalSilenceDuration: number;
  selection: AudioSelection | null;
  onDeleteSelection: () => void;
  onKeepSelectionOnly: () => void;
  onClearSelection: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  theme: ThemeMode;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  onDetectSilence,
  onNukeSilence,
  silenceCount,
  totalSilenceDuration,
  selection,
  onDeleteSelection,
  onKeepSelectionOnly,
  onClearSelection,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`w-full border rounded-xl p-4 sm:p-5 shadow-xl space-y-5 transition-colors ${
        isDark ? 'bg-[#0c0c0e] border-zinc-800' : 'bg-[#eee8dd] border-[#d8cfbe]'
      }`}
    >
      {/* Upper Bar: Detection Sliders & Controls */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF5500]" />
            <h2
              className={`font-mono text-sm font-bold uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}
            >
              Silence Detection & Dead Air Controls
            </h2>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1.5 font-mono">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs border rounded-md transition-colors disabled:opacity-30 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-800 hover:bg-[#e4ddd0] shadow-sm'
              }`}
              title="Undo last action (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs border rounded-md transition-colors disabled:opacity-30 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-800 hover:bg-[#e4ddd0] shadow-sm'
              }`}
              title="Redo last action (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Redo</span>
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl p-4 ${
            isDark ? 'bg-zinc-950/60 border-zinc-800/80' : 'bg-[#f4efe6] border-[#d8cfbe] shadow-sm'
          }`}
        >
          {/* Threshold Slider */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className={`flex justify-between items-center ${isDark ? 'text-zinc-300' : 'text-stone-900'}`}>
              <label htmlFor="threshold-slider" className="font-semibold">
                Decibel Threshold
              </label>
              <span className="text-[#FF5500] font-bold">{config.thresholdDb} dB</span>
            </div>
            <input
              id="threshold-slider"
              type="range"
              min="-60"
              max="-20"
              step="1"
              value={config.thresholdDb}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeConfig({ ...config, thresholdDb: val });
              }}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-[#d8cfbe]'
              }`}
            />
            <p className={`text-[11px] font-sans ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>
              Anything quieter than {config.thresholdDb}dB is flagged as dead air.
            </p>
          </div>

          {/* Min Duration Slider */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className={`flex justify-between items-center ${isDark ? 'text-zinc-300' : 'text-stone-900'}`}>
              <label htmlFor="duration-slider" className="font-semibold">
                Min Silence Duration
              </label>
              <span className="text-[#FF5500] font-bold">{config.minDuration.toFixed(1)}s</span>
            </div>
            <input
              id="duration-slider"
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={config.minDuration}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeConfig({ ...config, minDuration: val });
              }}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-[#d8cfbe]'
              }`}
            />
            <p className={`text-[11px] font-sans ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>
              Ignore brief pauses under {config.minDuration.toFixed(1)} seconds.
            </p>
          </div>

          {/* Safety Padding Margin Slider */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className={`flex justify-between items-center ${isDark ? 'text-zinc-300' : 'text-stone-900'}`}>
              <label htmlFor="padding-slider" className="font-semibold">
                Word Edge Padding
              </label>
              <span className="text-emerald-600 font-bold">{(config.padDuration * 1000).toFixed(0)} ms</span>
            </div>
            <input
              id="padding-slider"
              type="range"
              min="0.0"
              max="0.2"
              step="0.01"
              value={config.padDuration}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeConfig({ ...config, padDuration: val });
              }}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-zinc-800' : 'bg-[#d8cfbe]'
              }`}
            />
            <p className={`text-[11px] font-sans ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>
              Buffers word edges to avoid clipping vocal attacks/decays.
            </p>
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 pt-1 border-t ${
          isDark ? 'border-zinc-800/80' : 'border-[#d8cfbe]'
        }`}
      >
        {/* Nuke Dead Air Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNukeSilence}
            disabled={silenceCount === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg ${
              silenceCount > 0
                ? 'bg-[#FF5500] hover:bg-[#E64D00] text-white shadow-[#FF5500]/25 scale-100'
                : isDark
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-[#ded6c7] border border-[#c7bcaa] text-stone-500 cursor-not-allowed'
            }`}
          >
            <Flame className={`w-4 h-4 ${silenceCount > 0 ? 'animate-pulse' : ''}`} />
            <span>Nuke Dead Air ({silenceCount})</span>
          </button>

          <button
            onClick={onDetectSilence}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-mono text-xs font-semibold border transition-colors ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                : 'bg-[#f4efe6] hover:bg-[#e4ddd0] border-[#d8cfbe] text-stone-800 shadow-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Re-Scan Pauses</span>
          </button>

          {silenceCount > 0 && (
            <span className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>
              Cuts <strong className="text-[#FF5500]">{totalSilenceDuration.toFixed(1)}s</strong> total
            </span>
          )}
        </div>

        {/* Manual Trim Actions */}
        {selection && (
          <div
            className={`flex items-center gap-2 border rounded-xl p-1.5 font-mono text-xs ${
              isDark
                ? 'bg-blue-950/40 border-blue-800/60 text-blue-400'
                : 'bg-blue-100/70 border-blue-300 text-blue-900 shadow-sm'
            }`}
          >
            <span className="font-semibold px-2">
              Selection: {(selection.end - selection.start).toFixed(2)}s
            </span>
            <button
              onClick={onDeleteSelection}
              className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition-colors shadow-sm"
              title="Cut out selected section"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selection</span>
            </button>
            <button
              onClick={onKeepSelectionOnly}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors shadow-sm"
              title="Crop to selected section only"
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Keep Only</span>
            </button>
            <button
              onClick={onClearSelection}
              className="p-1.5 hover:bg-blue-200/50 rounded-md transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
