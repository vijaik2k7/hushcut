export function getItalianTempoTerm(bpm: number): string {
  if (bpm < 60) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 156) return 'Allegro';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo';
}

export function calculateTapTempo(taps: number[]): number | null {
  if (taps.length < 2) return null;
  // Consider up to the last 5 taps
  const recentTaps = taps.slice(-5);
  const intervals: number[] = [];

  for (let i = 1; i < recentTaps.length; i++) {
    intervals.push(recentTaps[i] - recentTaps[i - 1]);
  }

  const averageIntervalMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  if (averageIntervalMs <= 0) return null;

  const rawBpm = Math.round(60000 / averageIntervalMs);
  // Clamp between 30 and 300
  return Math.min(300, Math.max(30, rawBpm));
}
