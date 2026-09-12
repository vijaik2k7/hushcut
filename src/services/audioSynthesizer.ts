export type SoundProfile = 'woodblock' | 'mechanical' | 'synth';
export type BeatType = 'accent' | 'normal' | 'mute';

export function playTick(
  audioCtx: AudioContext,
  time: number,
  type: BeatType,
  profile: SoundProfile,
  volume: number
) {
  if (type === 'mute' || volume <= 0) return;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(volume * (type === 'accent' ? 1.0 : 0.7), time);
  masterGain.connect(audioCtx.destination);

  if (profile === 'woodblock') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const startFreq = type === 'accent' ? 800 : 600;
    const endFreq = type === 'accent' ? 300 : 200;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.015);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (type === 'accent' ? 0.045 : 0.035));

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.05);
  } else if (profile === 'mechanical') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = type === 'accent' ? 1600 : 1200;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.02);
  } else {
    // Warm Synth
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = type === 'accent' ? 880 : 440;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(1, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (type === 'accent' ? 0.06 : 0.04));

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.07);
  }
}
