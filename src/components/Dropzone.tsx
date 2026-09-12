import React, { useState, useEffect, useCallback } from 'react';
import { UploadCloud, FileAudio, FileVideo, Sparkles, Clipboard } from 'lucide-react';
import { ThemeMode } from '../types/audio';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  theme: ThemeMode;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected, isLoading, theme }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const isDark = theme === 'dark';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className="w-full max-w-4xl mx-auto my-auto px-4 py-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center cursor-pointer min-h-[380px] ${
          isDragOver
            ? 'border-[#FF5500] bg-[#FF5500]/10 scale-[1.01]'
            : isDark
            ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/80 hover:bg-zinc-900/60'
            : 'border-[#c7bcaa] hover:border-[#a89c89] bg-[#eee8dd] hover:bg-[#e4ddd0] shadow-sm'
        }`}
      >
        <input
          type="file"
          accept="video/*,audio/*,.mp4,.mov,.webm,.mp3,.wav,.m4a,.aac,.mkv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isLoading}
        />

        {/* Icon Cluster */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 rounded-2xl border flex items-center justify-center transition-colors shadow-xl ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300 group-hover:border-[#FF5500]/50 group-hover:text-[#FF5500]'
                : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-800 group-hover:border-[#FF5500] group-hover:text-[#FF5500]'
            }`}
          >
            <UploadCloud className="w-10 h-10" />
          </div>
          <div
            className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg border ${
              isDark
                ? 'bg-[#121215] border-zinc-800 text-emerald-400'
                : 'bg-[#f4efe6] border-[#d8cfbe] text-emerald-700 shadow-sm'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Headline */}
        <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>
          Drop your video or audio file here.
        </h2>

        {/* Clean, simple microcopy prompt */}
        <p className={`text-sm max-w-lg mb-6 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>
          Extract audio, strip silence, and export trimmed files in seconds.
        </p>

        {/* File Format Pill Matrix */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 font-mono text-xs">
          <span
            className={`flex items-center gap-1 border px-2.5 py-1 rounded-md ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-800 shadow-sm'
            }`}
          >
            <FileVideo className="w-3.5 h-3.5 text-[#FF5500]" /> .mp4 .mov .webm
          </span>
          <span
            className={`flex items-center gap-1 border px-2.5 py-1 rounded-md ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-800 shadow-sm'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5 text-emerald-600" /> .mp3 .wav .m4a .aac
          </span>
          <span
            className={`flex items-center gap-1 border px-2.5 py-1 rounded-md ${
              isDark
                ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                : 'bg-[#f4efe6] border-[#d8cfbe] text-stone-700 shadow-sm'
            }`}
          >
            <Clipboard className="w-3.5 h-3.5 text-stone-600" /> Paste (Cmd+V)
          </span>
        </div>

        {/* Action Button */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-semibold bg-[#FF5500] hover:bg-[#E64D00] text-white transition-all shadow-lg shadow-[#FF5500]/25">
          Select File from Device
        </div>

        <p className={`mt-4 text-[11px] font-mono ${isDark ? 'text-zinc-500' : 'text-stone-600'}`}>
          No file size limits. Supports all standard audio and video formats.
        </p>
      </div>
    </div>
  );
};
