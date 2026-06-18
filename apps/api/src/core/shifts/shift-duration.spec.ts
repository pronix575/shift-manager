import { describe, expect, it } from 'vitest';

import {
  formatDurationFromMilliseconds,
  getDurationMilliseconds,
  getRoundedDurationMinutes,
} from './shift-duration';

describe('shift-duration', () => {
  it('rounds duration minutes by the common rule', () => {
    expect(getRoundedDurationMinutes(29_999)).toBe(0);
    expect(getRoundedDurationMinutes(30_000)).toBe(1);
  });

  it('formats duration in hours and minutes', () => {
    expect(formatDurationFromMilliseconds(8_160_000)).toBe('2ч 16м');
  });

  it('returns zero duration for open shifts', () => {
    expect(getDurationMilliseconds(new Date('2026-06-17T08:00:00.000Z'), null))
      .toBe(0);
  });
});
