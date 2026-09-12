import { describe, it, expect } from 'vitest';
import { getItalianTempoTerm, calculateTapTempo } from './tempoUtils';

describe('tempoUtils', () => {
  it('returns correct Italian tempo terms based on BPM', () => {
    expect(getItalianTempoTerm(45)).toBe('Largo');
    expect(getItalianTempoTerm(70)).toBe('Adagio');
    expect(getItalianTempoTerm(90)).toBe('Andante');
    expect(getItalianTempoTerm(112)).toBe('Moderato');
    expect(getItalianTempoTerm(135)).toBe('Allegro');
    expect(getItalianTempoTerm(180)).toBe('Presto');
    expect(getItalianTempoTerm(220)).toBe('Prestissimo');
  });

  it('calculates tap tempo average correctly from tap timestamps in ms', () => {
    // 500ms intervals = 120 BPM
    const taps = [1000, 1500, 2000, 2500];
    expect(calculateTapTempo(taps)).toBe(120);
  });

  it('handles empty or single tap gracefully', () => {
    expect(calculateTapTempo([])).toBeNull();
    expect(calculateTapTempo([1000])).toBeNull();
  });
});
