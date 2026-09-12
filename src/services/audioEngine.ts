import { AudioFileMetadata } from '../types/audio';

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioContext = new AudioCtx();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

/**
 * Decodes an uploaded Audio or Video file into an AudioBuffer using Web Audio API.
 */
export async function decodeAudioFile(file: File): Promise<{
  audioBuffer: AudioBuffer;
  metadata: AudioFileMetadata;
}> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(file.name);
  const audioCtx = getAudioContext();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const metadata: AudioFileMetadata = {
      fileName: file.name,
      originalSize: file.size,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      fileType: file.type || (isVideo ? 'video/mp4' : 'audio/mp3'),
      isVideo,
    };

    return { audioBuffer, metadata };
  } catch (err) {
    console.error('Audio decoding error:', err);
    if (file.size > 500 * 1024 * 1024) {
      throw new Error('File exceeds 500MB browser memory limit. Try a smaller file.');
    }
    throw new Error('Unable to extract audio track. Ensure the file contains valid audio (AAC, MP3, PCM, Opus, Vorbis).');
  }
}

/**
 * Strips out specified time regions (silences or selections) from an AudioBuffer,
 * stitching remaining non-silent audio seamlessly.
 */
export function removeRegions(
  sourceBuffer: AudioBuffer,
  regionsToRemove: { start: number; end: number }[]
): AudioBuffer {
  if (!regionsToRemove || regionsToRemove.length === 0) {
    return sourceBuffer;
  }

  const sampleRate = sourceBuffer.sampleRate;
  const numChannels = sourceBuffer.numberOfChannels;
  const totalDuration = sourceBuffer.duration;

  // Sort and merge overlapping regions to remove
  const sorted = [...regionsToRemove].sort((a, b) => a.start - b.start);
  const mergedToRemove: { start: number; end: number }[] = [];

  for (const reg of sorted) {
    const start = Math.max(0, reg.start);
    const end = Math.min(totalDuration, reg.end);
    if (start >= end) continue;

    if (mergedToRemove.length === 0) {
      mergedToRemove.push({ start, end });
    } else {
      const last = mergedToRemove[mergedToRemove.length - 1];
      if (start <= last.end) {
        last.end = Math.max(last.end, end);
      } else {
        mergedToRemove.push({ start, end });
      }
    }
  }

  // Calculate keep regions (gaps between removal regions)
  const keepRegions: { start: number; end: number }[] = [];
  let currentPos = 0;

  for (const rem of mergedToRemove) {
    if (rem.start > currentPos) {
      keepRegions.push({ start: currentPos, end: rem.start });
    }
    currentPos = Math.max(currentPos, rem.end);
  }

  if (currentPos < totalDuration) {
    keepRegions.push({ start: currentPos, end: totalDuration });
  }

  if (keepRegions.length === 0) {
    // Everything removed: return 0.1s silent buffer
    const audioCtx = getAudioContext();
    return audioCtx.createBuffer(numChannels, Math.floor(sampleRate * 0.1), sampleRate);
  }

  // Calculate new total sample length
  let totalNewSamples = 0;
  const sampleRanges = keepRegions.map((reg) => {
    const startSample = Math.floor(reg.start * sampleRate);
    const endSample = Math.min(sourceBuffer.length, Math.floor(reg.end * sampleRate));
    const count = Math.max(0, endSample - startSample);
    totalNewSamples += count;
    return { startSample, endSample, count };
  });

  const audioCtx = getAudioContext();
  const newBuffer = audioCtx.createBuffer(numChannels, totalNewSamples, sampleRate);

  // Copy channel data for each keep range
  for (let c = 0; c < numChannels; c++) {
    const srcChannel = sourceBuffer.getChannelData(c);
    const destChannel = newBuffer.getChannelData(c);

    let destOffset = 0;
    for (const range of sampleRanges) {
      if (range.count > 0) {
        destChannel.set(srcChannel.subarray(range.startSample, range.endSample), destOffset);
        destOffset += range.count;
      }
    }
  }

  return newBuffer;
}

/**
 * Keeps only the specified start-to-end slice of an AudioBuffer.
 */
export function cropAudioBuffer(
  sourceBuffer: AudioBuffer,
  cropStart: number,
  cropEnd: number
): AudioBuffer {
  const sampleRate = sourceBuffer.sampleRate;
  const numChannels = sourceBuffer.numberOfChannels;

  const startSample = Math.max(0, Math.floor(cropStart * sampleRate));
  const endSample = Math.min(sourceBuffer.length, Math.floor(cropEnd * sampleRate));
  const newLength = Math.max(1, endSample - startSample);

  const audioCtx = getAudioContext();
  const newBuffer = audioCtx.createBuffer(numChannels, newLength, sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const srcChannel = sourceBuffer.getChannelData(c);
    const destChannel = newBuffer.getChannelData(c);
    destChannel.set(srcChannel.subarray(startSample, endSample), 0);
  }

  return newBuffer;
}
