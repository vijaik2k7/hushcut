// @ts-ignore
import lamejs from 'lamejs';
import { Mp3Bitrate } from '../types/audio';

/**
 * Encodes AudioBuffer into MP3 format using lamejs in client-side JS.
 */
export async function encodeMp3(
  audioBuffer: AudioBuffer,
  bitrate: Mp3Bitrate = 192,
  onProgress?: (progressPercentage: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const totalSamples = audioBuffer.length;

      // LAME mp3 encoder instance
      const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, bitrate);
      const mp3Data: Uint8Array[] = [];

      const leftChannel = audioBuffer.getChannelData(0);
      const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

      // Process samples in blocks of 1152 (standard MP3 frame size)
      const sampleBlockSize = 1152;
      const leftInt16 = new Int16Array(sampleBlockSize);
      const rightInt16 = new Int16Array(sampleBlockSize);

      let offset = 0;

      const processChunk = () => {
        const chunkSize = Math.min(sampleBlockSize, totalSamples - offset);
        if (chunkSize <= 0) {
          // Flush encoder
          const endBuf = mp3encoder.flush();
          if (endBuf.length > 0) {
            mp3Data.push(new Uint8Array(endBuf));
          }
          if (onProgress) onProgress(100);
          resolve(new Blob(mp3Data as unknown as BlobPart[], { type: 'audio/mp3' }));
          return;
        }

        for (let j = 0; j < chunkSize; j++) {
          let l = leftChannel[offset + j];
          let r = rightChannel[offset + j];

          // Clamp
          l = Math.max(-1, Math.min(1, l));
          r = Math.max(-1, Math.min(1, r));

          leftInt16[j] = l < 0 ? l * 0x8000 : l * 0x7fff;
          rightInt16[j] = r < 0 ? r * 0x8000 : r * 0x7fff;
        }

        let mp3buf: Int8Array;
        if (numChannels === 1) {
          mp3buf = mp3encoder.encodeBuffer(leftInt16.subarray(0, chunkSize));
        } else {
          mp3buf = mp3encoder.encodeBuffer(
            leftInt16.subarray(0, chunkSize),
            rightInt16.subarray(0, chunkSize)
          );
        }

        if (mp3buf && mp3buf.length > 0) {
          mp3Data.push(new Uint8Array(mp3buf));
        }

        offset += chunkSize;

        if (onProgress && offset % (sampleBlockSize * 20) === 0) {
          const progress = Math.min(99, Math.round((offset / totalSamples) * 100));
          onProgress(progress);
        }

        // Use setTimeout to keep UI responsive during encoding
        if (offset < totalSamples) {
          if (offset % (sampleBlockSize * 100) === 0) {
            setTimeout(processChunk, 0);
          } else {
            processChunk();
          }
        } else {
          const endBuf = mp3encoder.flush();
          if (endBuf.length > 0) {
            mp3Data.push(new Uint8Array(endBuf));
          }
          if (onProgress) onProgress(100);
          resolve(new Blob(mp3Data as unknown as BlobPart[], { type: 'audio/mp3' }));
        }
      };

      processChunk();
    } catch (err) {
      reject(err);
    }
  });
}
