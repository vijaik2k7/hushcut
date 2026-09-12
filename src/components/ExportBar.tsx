import React from 'react';
import { ExportOptions, ExportFormat, Mp3Bitrate, AudioFileMetadata, ThemeMode } from '../types/audio';
import { Download, HardDrive, Sparkles, Loader2 } from 'lucide-react';

interface ExportBarProps {
  metadata: AudioFileMetadata | null;
  currentDuration: number;
  originalDuration: number;
  exportOptions: ExportOptions;
  onChangeExportOptions: (options: ExportOptions) => void;
  onExport: () => void;
  isExporting: boolean;
  exportProgress: number;
  theme: ThemeMode;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  metadata,
  currentDuration,
  originalDuration,
  exportOptions,
  onChangeExportOptions,
  onExport,
  isExporting,
  exportProgress,
  theme,
}) => {
  const isDark = theme === 'dark';

  const estimateSize = (): number => {
    if (!metadata) return 0;
    const channels = metadata.numberOfChannels || 2;
    const sampleRate = metadata.sampleRate || 44100;

    if (exportOptions.format === 'wav') {
      return Math.round(currentDuration * sampleRate * channels * 2);
    } else {
      return Math.round(currentDuration * (exportOptions.mp3Bitrate * 1000) / 8);
    }
  };

  const estimatedSizeBytes = estimateSize();
  const timeSaved = Math.max(0, originalDuration - currentDuration);
  const percentReduced = originalDuration > 0 ? (timeSaved / originalDuration) * 100 : 0;

  return (
    <div
      className={`w-full border rounded-xl p-4 sm:p-5 shadow-xl space-y-4 transition-colors ${
        isDark ? 'bg-[#0c0c0e] border-zinc-800' : 'bg-[#eee8dd] border-[#d8cfbe]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Format & Preset Selectors */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-zinc-400 font-medium' : 'text-stone-700 font-medium'}>Format:</span>
            <div
              className={`flex border rounded-lg p-0.5 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#f4efe6] border-[#d8cfbe] shadow-sm'
              }`}
            >
              {(['wav', 'mp3'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => onChangeExportOptions({ ...exportOptions, format: fmt })}
                  className={`px-3 py-1 rounded-md uppercase font-bold transition-colors ${
                    exportOptions.format === fmt
                      ? 'bg-[#FF5500] text-white shadow-sm'
                      : isDark
                      ? 'text-zinc-400 hover:text-white'
                      : 'text-stone-700 hover:text-stone-900'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* MP3 Bitrate Dropdown */}
          {exportOptions.format === 'mp3' && (
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-zinc-400 font-medium' : 'text-stone-700 font-medium'}>Bitrate:</span>
              <select
                value={exportOptions.mp3Bitrate}
                onChange={(e) =>
                  onChangeExportOptions({
                    ...exportOptions,
                    mp3Bitrate: Number(e.target.value) as Mp3Bitrate,
                  })
                }
                className={`border rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#FF5500] ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-white'
                    : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-900 shadow-sm'
                }`}
              >
                <option value={128}>128 kbps (Standard)</option>
                <option value={192}>192 kbps (High Quality)</option>
                <option value={256}>256 kbps (Very High)</option>
                <option value={320}>320 kbps (Maximum)</option>
              </select>
            </div>
          )}
        </div>

        {/* Readouts & Metrics */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div
            className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg ${
              isDark
                ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300'
                : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-900 shadow-sm'
            }`}
          >
            <HardDrive className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-400' : 'text-stone-600'}`} />
            <span className={isDark ? 'text-zinc-400' : 'text-stone-600'}>Est. Size:</span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
              {formatBytes(estimatedSizeBytes)}
            </span>
          </div>

          {timeSaved > 0.1 && (
            <div
              className={`hidden sm:flex items-center gap-1.5 border px-3 py-1.5 rounded-lg ${
                isDark
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400'
                  : 'bg-emerald-100/80 border-emerald-300 text-emerald-800 shadow-sm'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Saved {timeSaved.toFixed(1)}s ({percentReduced.toFixed(0)}%)</span>
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          disabled={isExporting || currentDuration <= 0}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg ${
            isExporting
              ? 'bg-zinc-800 border border-zinc-700 text-zinc-400 cursor-wait'
              : 'bg-[#FF5500] hover:bg-[#E64D00] text-white shadow-[#FF5500]/25 scale-100'
          }`}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Encoding Audio ({exportProgress}%)...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export {exportOptions.format.toUpperCase()} Audio</span>
            </>
          )}
        </button>
      </div>

      {isExporting && (
        <div className="space-y-1 pt-2">
          <div
            className={`w-full border rounded-full h-2 overflow-hidden ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#d8cfbe] border-[#c7bcaa]'
            }`}
          >
            <div
              className="bg-[#FF5500] h-full transition-all duration-150"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <div className={`flex justify-between text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>
            <span>Encoding audio file...</span>
            <span>{exportProgress}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
