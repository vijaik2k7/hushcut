export interface SilenceRegion {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  duration: number; // in seconds
}

export interface AudioSelection {
  start: number; // in seconds
  end: number;   // in seconds
}

export interface SilenceConfig {
  thresholdDb: number;   // -60dB to -20dB
  minDuration: number;   // 0.1s to 3.0s
  padDuration: number;   // safety margin in seconds (e.g. 0.05s)
}

export type ExportFormat = 'wav' | 'mp3';
export type Mp3Bitrate = 128 | 192 | 256 | 320;
export type ThemeMode = 'dark' | 'light';

export interface ExportOptions {
  format: ExportFormat;
  mp3Bitrate: Mp3Bitrate;
}

export interface AudioFileMetadata {
  fileName: string;
  originalSize: number;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  fileType: string;
  isVideo: boolean;
}

export interface ProcessingProgress {
  status: 'idle' | 'decoding' | 'analyzing' | 'trimming' | 'encoding' | 'done' | 'error';
  message: string;
  percentage: number;
}
