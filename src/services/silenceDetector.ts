import { SilenceConfig, SilenceRegion } from '../types/audio';

/**
 * Detects silent regions in an AudioBuffer using RMS decibel thresholding.
 */
export function detectSilence(
  audioBuffer: AudioBuffer,
  config: SilenceConfig
): SilenceRegion[] {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const totalSamples = audioBuffer.length;
  
  // Frame size of ~10ms for granularity
  const frameSize = Math.floor(sampleRate * 0.01);
  const totalFrames = Math.floor(totalSamples / frameSize);

  // Extract channel data pointers
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  const isSilentFrame = new Uint8Array(totalFrames);

  for (let f = 0; f < totalFrames; f++) {
    const startSample = f * frameSize;
    let sumSquares = 0;

    for (let i = 0; i < frameSize; i++) {
      const idx = startSample + i;
      let sampleAvg = 0;
      for (let c = 0; c < numChannels; c++) {
        sampleAvg += channels[c][idx];
      }
      sampleAvg /= numChannels;
      sumSquares += sampleAvg * sampleAvg;
    }

    const rms = Math.sqrt(sumSquares / frameSize);
    const db = rms > 0.000001 ? 20 * Math.log10(rms) : -100;

    if (db < config.thresholdDb) {
      isSilentFrame[f] = 1;
    }
  }

  // Group continuous silent frames into regions
  const rawRegions: { start: number; end: number }[] = [];
  let inSilence = false;
  let silenceStartFrame = 0;

  for (let f = 0; f < totalFrames; f++) {
    if (isSilentFrame[f] === 1) {
      if (!inSilence) {
        inSilence = true;
        silenceStartFrame = f;
      }
    } else {
      if (inSilence) {
        inSilence = false;
        const startTime = (silenceStartFrame * frameSize) / sampleRate;
        const endTime = (f * frameSize) / sampleRate;
        if (endTime - startTime >= config.minDuration) {
          rawRegions.push({ start: startTime, end: endTime });
        }
      }
    }
  }

  // Handle trailing silence
  if (inSilence) {
    const startTime = (silenceStartFrame * frameSize) / sampleRate;
    const endTime = totalSamples / sampleRate;
    if (endTime - startTime >= config.minDuration) {
      rawRegions.push({ start: startTime, end: endTime });
    }
  }

  // Apply pad duration (safety margin so spoken words aren't truncated)
  const regions: SilenceRegion[] = [];
  let regionIdCounter = 1;

  for (const reg of rawRegions) {
    // Contract the silence window slightly by padDuration on both ends
    const paddedStart = Math.min(reg.end, reg.start + config.padDuration);
    const paddedEnd = Math.max(reg.start, reg.end - config.padDuration);

    if (paddedEnd - paddedStart >= 0.05) {
      regions.push({
        id: `silence-${regionIdCounter++}`,
        start: paddedStart,
        end: paddedEnd,
        duration: paddedEnd - paddedStart,
      });
    }
  }

  return regions;
}
