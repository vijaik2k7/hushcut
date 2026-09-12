import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { WaveformViewport } from './components/WaveformViewport';
import { ControlPanel } from './components/ControlPanel';
import { ExportBar } from './components/ExportBar';
import { ShortcutsModal } from './components/ShortcutsModal';
import { useAudioPlayer } from './hooks/useAudioPlayer';

import {
  AudioFileMetadata,
  SilenceConfig,
  SilenceRegion,
  AudioSelection,
  ExportOptions,
  ProcessingProgress,
  ThemeMode,
} from './types/audio';

import { decodeAudioFile, removeRegions, cropAudioBuffer } from './services/audioEngine';
import { detectSilence } from './services/silenceDetector';
import { encodeWav } from './services/wavEncoder';
import { encodeMp3 } from './services/mp3Encoder';

import { Loader2, AlertTriangle, XCircle, CheckCircle2, Coffee } from 'lucide-react';

export const App: React.FC = () => {
  // Theme state ('dark' | 'light') with local storage persistence
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('hushcut-theme');
    return (saved === 'light' ? 'light' : 'dark') as ThemeMode;
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('hushcut-theme', nextTheme);
  };

  // Sync background color with theme (Medium eye-soothing beige #e2dbce)
  useEffect(() => {
    if (theme === 'light') {
      document.body.style.backgroundColor = '#e2dbce';
      document.body.style.color = '#1c1917';
    } else {
      document.body.style.backgroundColor = '#09090b';
      document.body.style.color = '#f4f4f5';
    }
  }, [theme]);

  // File & Audio States
  const [metadata, setMetadata] = useState<AudioFileMetadata | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  // History Stack for Undo/Redo
  const [historyStack, setHistoryStack] = useState<AudioBuffer[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Silence Detection Configuration
  const [silenceConfig, setSilenceConfig] = useState<SilenceConfig>({
    thresholdDb: -40,
    minDuration: 0.5,
    padDuration: 0.05,
  });

  const [silenceRegions, setSilenceRegions] = useState<SilenceRegion[]>([]);
  const [selection, setSelection] = useState<AudioSelection | null>(null);

  // Export State
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'wav',
    mp3Bitrate: 192,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Status & Modals
  const [progress, setProgress] = useState<ProcessingProgress>({
    status: 'idle',
    message: '',
    percentage: 0,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Audio Playback Hook
  const { isPlaying, currentTime, togglePlayPause, seekTo, stopPlayback } = useAudioPlayer(audioBuffer);

  // Auto detect silence whenever audioBuffer or config changes
  useEffect(() => {
    if (audioBuffer) {
      const regions = detectSilence(audioBuffer, silenceConfig);
      setSilenceRegions(regions);
    } else {
      setSilenceRegions([]);
    }
  }, [audioBuffer, silenceConfig]);

  // Push new AudioBuffer to Undo/Redo History
  const pushToHistory = useCallback((newBuf: AudioBuffer) => {
    setHistoryStack((prevStack) => {
      const newStack = prevStack.slice(0, historyIndex + 1);
      newStack.push(newBuf);
      setHistoryIndex(newStack.length - 1);
      return newStack;
    });
    setAudioBuffer(newBuf);
  }, [historyIndex]);

  // Load and decode user file
  const handleFileSelected = async (file: File) => {
    setErrorMsg(null);
    stopPlayback();
    setProgress({
      status: 'decoding',
      message: 'Extracting audio track from media file...',
      percentage: 25,
    });

    try {
      const { audioBuffer: decodedBuffer, metadata: meta } = await decodeAudioFile(file);
      setMetadata(meta);
      setHistoryStack([decodedBuffer]);
      setHistoryIndex(0);
      setAudioBuffer(decodedBuffer);
      setSelection(null);

      setProgress({
        status: 'done',
        message: 'Audio loaded successfully.',
        percentage: 100,
      });
      setTimeout(() => setProgress({ status: 'idle', message: '', percentage: 0 }), 1500);
    } catch (err: unknown) {
      console.error(err);
      setProgress({ status: 'idle', message: '', percentage: 0 });
      setErrorMsg(err instanceof Error ? err.message : 'Failed to read media file.');
    }
  };

  // Reset workspace
  const handleReset = () => {
    stopPlayback();
    setMetadata(null);
    setAudioBuffer(null);
    setHistoryStack([]);
    setHistoryIndex(-1);
    setSilenceRegions([]);
    setSelection(null);
    setErrorMsg(null);
  };

  // Action: Nuke All Detected Silence Regions
  const handleNukeSilence = () => {
    if (!audioBuffer || silenceRegions.length === 0) return;
    stopPlayback();

    const regionsToRemove = silenceRegions.map((r) => ({ start: r.start, end: r.end }));
    const newBuffer = removeRegions(audioBuffer, regionsToRemove);

    pushToHistory(newBuffer);
    setSelection(null);
  };

  // Action: Delete Selected Range
  const handleDeleteSelection = () => {
    if (!audioBuffer || !selection) return;
    stopPlayback();

    const newBuffer = removeRegions(audioBuffer, [selection]);
    pushToHistory(newBuffer);
    setSelection(null);
  };

  // Action: Keep Only Selected Range (Crop)
  const handleKeepSelectionOnly = () => {
    if (!audioBuffer || !selection) return;
    stopPlayback();

    const newBuffer = cropAudioBuffer(audioBuffer, selection.start, selection.end);
    pushToHistory(newBuffer);
    setSelection(null);
  };

  // Action: Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      stopPlayback();
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setAudioBuffer(historyStack[prevIndex]);
      setSelection(null);
    }
  };

  // Action: Redo
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      stopPlayback();
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setAudioBuffer(historyStack[nextIndex]);
      setSelection(null);
    }
  };

  // Action: Export Audio File
  const handleExport = async () => {
    if (!audioBuffer || !metadata) return;
    stopPlayback();
    setIsExporting(true);
    setExportProgress(10);

    try {
      let blob: Blob;
      let extension = exportOptions.format;

      if (exportOptions.format === 'wav') {
        setExportProgress(50);
        blob = encodeWav(audioBuffer);
        setExportProgress(100);
      } else {
        blob = await encodeMp3(audioBuffer, exportOptions.mp3Bitrate, (pct) => {
          setExportProgress(pct);
        });
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const baseName = metadata.fileName.replace(/\.[^/.]+$/, '');
      link.href = url;
      link.download = `${baseName}_hushcut.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Encoding failed. Try exporting to WAV format.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'SELECT')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (audioBuffer) togglePlayPause();
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selection) {
          e.preventDefault();
          handleDeleteSelection();
        }
      } else if (e.code === 'Escape') {
        if (selection) {
          setSelection(null);
        } else if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.code === 'KeyY') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [audioBuffer, selection, isShortcutsOpen, togglePlayPause]);

  const totalSilenceDuration = silenceRegions.reduce((acc, r) => acc + r.duration, 0);
  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans transition-colors selection:bg-[#FF5500] selection:text-white ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#e2dbce] text-stone-900'
      }`}
    >
      {/* Top Header */}
      <Header
        metadata={metadata}
        onReset={handleReset}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col justify-center px-4 py-6 max-w-6xl mx-auto w-full">
        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/70 border border-rose-800 text-rose-200 rounded-xl flex items-center justify-between gap-3 font-mono text-xs shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white p-1">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading Progress State */}
        {progress.status !== 'idle' && (
          <div
            className={`mb-6 p-4 border rounded-xl flex items-center gap-3 font-mono text-xs shadow-lg ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-[#eee8dd] border-[#d8cfbe] text-stone-900'
            }`}
          >
            {progress.status === 'done' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Loader2 className="w-5 h-5 text-[#FF5500] animate-spin" />
            )}
            <span>{progress.message}</span>
          </div>
        )}

        {/* View Switcher: Dropzone when empty vs Workspace when file loaded */}
        {!audioBuffer ? (
          <Dropzone
            onFileSelected={handleFileSelected}
            isLoading={progress.status !== 'idle'}
            theme={theme}
          />
        ) : (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Waveform Viewport */}
            <WaveformViewport
              audioBuffer={audioBuffer}
              currentTime={currentTime}
              silenceRegions={silenceRegions}
              selection={selection}
              isPlaying={isPlaying}
              onTogglePlay={togglePlayPause}
              onSeek={seekTo}
              onSelectionChange={setSelection}
              theme={theme}
            />

            {/* Control Panel */}
            <ControlPanel
              config={silenceConfig}
              onChangeConfig={setSilenceConfig}
              onDetectSilence={() => {
                if (audioBuffer) setSilenceRegions(detectSilence(audioBuffer, silenceConfig));
              }}
              onNukeSilence={handleNukeSilence}
              silenceCount={silenceRegions.length}
              totalSilenceDuration={totalSilenceDuration}
              selection={selection}
              onDeleteSelection={handleDeleteSelection}
              onKeepSelectionOnly={handleKeepSelectionOnly}
              onClearSelection={() => setSelection(null)}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < historyStack.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              theme={theme}
            />

            {/* Export Bar */}
            <ExportBar
              metadata={metadata}
              currentDuration={audioBuffer.duration}
              originalDuration={historyStack[0]?.duration || audioBuffer.duration}
              exportOptions={exportOptions}
              onChangeExportOptions={setExportOptions}
              onExport={handleExport}
              isExporting={isExporting}
              exportProgress={exportProgress}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* Clean Footer with Buy Me A Coffee link */}
      <footer
        className={`border-t py-3.5 px-4 text-center font-mono text-xs flex flex-wrap items-center justify-between gap-3 transition-colors ${
          isDark ? 'border-zinc-900 bg-[#09090b] text-zinc-500' : 'border-[#d8cfbe] bg-[#eee8dd] text-stone-700'
        }`}
      >
        <span>HushCut • Fast Audio Extractor & Silence Trimmer</span>
        <a
          href="https://buymeacoffee.com/vijaik2k7"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-sans font-bold text-amber-600 hover:text-amber-500 transition-colors"
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Buy me a coffee</span>
        </a>
      </footer>

      {/* Shortcuts Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} theme={theme} />
    </div>
  );
};

export default App;
