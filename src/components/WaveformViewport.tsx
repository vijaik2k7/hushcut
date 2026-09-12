import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SilenceRegion, AudioSelection, ThemeMode } from '../types/audio';
import { Play, Pause, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface WaveformViewportProps {
  audioBuffer: AudioBuffer | null;
  currentTime: number;
  silenceRegions: SilenceRegion[];
  selection: AudioSelection | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSelectionChange: (selection: AudioSelection | null) => void;
  theme: ThemeMode;
}

export function formatTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(mins)}:${pad(secs)}.${ms}`;
}

export const WaveformViewport: React.FC<WaveformViewportProps> = ({
  audioBuffer,
  currentTime,
  silenceRegions,
  selection,
  isPlaying,
  onTogglePlay,
  onSeek,
  onSelectionChange,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [dragStartSec, setDragStartSec] = useState<number | null>(null);

  const peaksRef = useRef<{ max: Float32Array; min: Float32Array } | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!audioBuffer) {
      peaksRef.current = null;
      return;
    }

    const numSamples = audioBuffer.length;
    const channelData = audioBuffer.getChannelData(0);

    const numPoints = 2500;
    const samplesPerPoint = Math.max(1, Math.floor(numSamples / numPoints));

    const maxPeaks = new Float32Array(numPoints);
    const minPeaks = new Float32Array(numPoints);

    for (let i = 0; i < numPoints; i++) {
      const start = i * samplesPerPoint;
      const end = Math.min(numSamples, start + samplesPerPoint);
      let min = 0;
      let max = 0;

      for (let j = start; j < end; j++) {
        const val = channelData[j];
        if (val < min) min = val;
        if (val > max) max = val;
      }
      maxPeaks[i] = max;
      minPeaks[i] = min;
    }

    peaksRef.current = { max: maxPeaks, min: minPeaks };
  }, [audioBuffer]);

  useEffect(() => {
    if (isPlaying && audioBuffer && containerRef.current && zoom > 1) {
      const containerWidth = containerRef.current.clientWidth;
      const totalWidth = containerWidth * zoom;
      const playheadX = (currentTime / audioBuffer.duration) * totalWidth;
      const targetScroll = Math.max(0, playheadX - containerWidth / 2);
      setScrollLeft(targetScroll);
    }
  }, [currentTime, isPlaying, audioBuffer, zoom]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !audioBuffer || !peaksRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = container.clientWidth;
    const height = 220;
    const totalWidth = width * zoom;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    // Canvas Background - Medium soothing beige in light mode
    ctx.fillStyle = isDark ? '#09090b' : '#e2dbce';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-scrollLeft, 0);

    const duration = audioBuffer.duration;
    const centerY = height / 2 + 10;
    const waveHeight = (height - 50) / 2;

    // 1. Time Ruler (Top 28px)
    ctx.fillStyle = isDark ? '#121215' : '#ded6c7';
    ctx.fillRect(0, 0, totalWidth, 28);
    ctx.strokeStyle = isDark ? '#27272a' : '#c7bcaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.lineTo(totalWidth, 28);
    ctx.stroke();

    const stepSeconds = zoom > 5 ? 0.5 : zoom > 2 ? 1 : 5;
    ctx.fillStyle = isDark ? '#71717a' : '#6b5e52';
    ctx.font = '10px "JetBrains Mono", monospace';

    for (let sec = 0; sec <= duration; sec += stepSeconds) {
      const x = (sec / duration) * totalWidth;
      ctx.strokeStyle = sec % 5 === 0 ? (isDark ? '#3f3f46' : '#b8ab97') : (isDark ? '#27272a' : '#c7bcaa');
      ctx.beginPath();
      ctx.moveTo(x, sec % 5 === 0 ? 12 : 20);
      ctx.lineTo(x, 28);
      ctx.stroke();

      if (sec % stepSeconds === 0) {
        ctx.fillText(formatTimecode(sec), x + 3, 18);
      }
    }

    // 2. Center Zero-Line
    ctx.strokeStyle = isDark ? '#27272a' : '#c7bcaa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(totalWidth, centerY);
    ctx.stroke();

    // 3. Draw Waveform Peaks
    const peaks = peaksRef.current;
    const numPoints = peaks.max.length;

    ctx.fillStyle = isDark ? '#d4d4d8' : '#2c2825'; // dark mocha wave peaks
    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * totalWidth;
      const barWidth = Math.max(1, totalWidth / numPoints);
      const topY = centerY - peaks.max[i] * waveHeight;
      const bottomY = centerY - peaks.min[i] * waveHeight;
      const barH = Math.max(2, bottomY - topY);

      ctx.fillRect(x, topY, barWidth, barH);
    }

    // 4. Highlight Silent Regions
    for (const reg of silenceRegions) {
      const startX = (reg.start / duration) * totalWidth;
      const endX = (reg.end / duration) * totalWidth;
      const regW = Math.max(2, endX - startX);

      ctx.fillStyle = isDark ? 'rgba(255, 85, 0, 0.22)' : 'rgba(255, 85, 0, 0.32)';
      ctx.fillRect(startX, 28, regW, height - 28);

      ctx.fillStyle = '#FF5500';
      ctx.fillRect(startX, 28, regW, 3);

      if (regW > 50) {
        ctx.fillStyle = '#FF5500';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillText(`SILENCE ${reg.duration.toFixed(1)}s`, startX + 6, 44);
      }
    }

    // 5. Highlight Manual Selection Range
    if (selection) {
      const selStartX = (selection.start / duration) * totalWidth;
      const selEndX = (selection.end / duration) * totalWidth;
      const selW = Math.abs(selEndX - selStartX);
      const minX = Math.min(selStartX, selEndX);

      ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.28)';
      ctx.fillRect(minX, 28, selW, height - 28);

      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2;
      ctx.strokeRect(minX, 28, selW, height - 28);

      ctx.fillStyle = '#1d4ed8';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      const selDur = Math.abs(selection.end - selection.start);
      ctx.fillText(`Selected: ${selDur.toFixed(2)}s`, minX + 6, 44);
    }

    // 6. Draw Playhead
    const playheadX = (currentTime / duration) * totalWidth;

    ctx.strokeStyle = '#FF5500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    ctx.fillStyle = '#FF5500';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, [audioBuffer, currentTime, silenceRegions, selection, zoom, scrollLeft, isDark]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const handleResize = () => drawCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawCanvas]);

  const getTimeFromMouseEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (!container || !audioBuffer) return 0;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left + scrollLeft;
    const totalWidth = container.clientWidth * zoom;
    const ratio = Math.max(0, Math.min(1, clickX / totalWidth));
    return ratio * audioBuffer.duration;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer) return;
    const clickTime = getTimeFromMouseEvent(e);
    setDragStartSec(clickTime);
    setIsDraggingSelection(true);
    onSeek(clickTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingSelection || dragStartSec === null || !audioBuffer) return;
    const currentTimeAtMouse = getTimeFromMouseEvent(e);

    const start = Math.min(dragStartSec, currentTimeAtMouse);
    const end = Math.max(dragStartSec, currentTimeAtMouse);

    if (end - start > 0.05) {
      onSelectionChange({ start, end });
    } else {
      onSelectionChange(null);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingSelection(false);
    setDragStartSec(null);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  if (!audioBuffer) return null;

  const totalWidth = containerRef.current ? containerRef.current.clientWidth * zoom : 800;

  return (
    <div
      className={`w-full border rounded-xl p-4 shadow-xl transition-colors ${
        isDark ? 'bg-[#0c0c0e] border-zinc-800' : 'bg-[#eee8dd] border-[#d8cfbe]'
      }`}
    >
      {/* Top Viewport Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 font-mono text-xs">
        {/* Play / Timecode */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white transition-all shadow-md ${
              isPlaying
                ? isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700'
                  : 'bg-[#d8cfbe] hover:bg-[#c7bcaa] text-stone-900 border border-[#b8ab97]'
                : 'bg-[#FF5500] hover:bg-[#E64D00] shadow-[#FF5500]/20'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <div
            className={`flex items-baseline gap-1.5 border px-3 py-1.5 rounded-lg ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#f4efe6] border-[#d8cfbe] shadow-sm'
            }`}
          >
            <span className={`text-[10px] uppercase ${isDark ? 'text-zinc-400' : 'text-stone-600'}`}>POS</span>
            <span className={`font-bold text-sm tracking-wider ${isDark ? 'text-white' : 'text-stone-900'}`}>
              {formatTimecode(currentTime)}
            </span>
            <span className={isDark ? 'text-zinc-600' : 'text-stone-400'}>/</span>
            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>
              {formatTimecode(audioBuffer.duration)}
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div
          className={`flex items-center gap-2 border p-1 rounded-lg ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-[#f4efe6] border-[#d8cfbe] shadow-sm'
          }`}
        >
          <span className={`text-[11px] px-1.5 font-medium ${isDark ? 'text-zinc-400' : 'text-stone-700'}`}>Zoom</span>
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 1))}
            disabled={zoom <= 1}
            className={`p-1 rounded disabled:opacity-30 ${
              isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-[#e4ddd0] text-stone-800'
            }`}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className={`text-[11px] px-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>{zoom}x</span>
          <button
            onClick={() => setZoom((z) => Math.min(10, z + 1))}
            disabled={zoom >= 10}
            className={`p-1 rounded disabled:opacity-30 ${
              isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-[#e4ddd0] text-stone-800'
            }`}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className={`p-1 rounded ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-[#e4ddd0] text-stone-600 hover:text-stone-900'
            }`}
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport Box */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`relative w-full overflow-x-auto overflow-y-hidden border rounded-lg cursor-crosshair ${
          isDark ? 'border-zinc-800 bg-[#09090b]' : 'border-[#d8cfbe] bg-[#e2dbce]'
        }`}
      >
        <div style={{ width: `${totalWidth}px` }} className="relative h-[220px]">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="block"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div
        className={`flex items-center justify-between mt-2.5 px-1 font-mono text-[11px] ${
          isDark ? 'text-zinc-400' : 'text-stone-700'
        }`}
      >
        <div>
          {silenceRegions.length > 0 ? (
            <span className="text-[#FF5500] font-semibold">
              ⚠️ {silenceRegions.length} silent gap{silenceRegions.length > 1 ? 's' : ''} detected (
              {silenceRegions.reduce((acc, r) => acc + r.duration, 0).toFixed(1)}s dead air)
            </span>
          ) : (
            <span>No silent pauses detected at current threshold.</span>
          )}
        </div>
        <div className="hidden sm:block">
          Click canvas to scrub • Drag mouse to select range
        </div>
      </div>
    </div>
  );
};
