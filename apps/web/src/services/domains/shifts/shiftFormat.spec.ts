import { describe, expect, it } from 'vitest';

import {
  formatDurationPartsLabel,
  formatDurationFromHours,
  formatDurationFromMilliseconds,
  formatDurationFromMinutes,
  getDurationPartsFromMilliseconds,
  getShiftDuration,
} from './shiftFormat';

describe('shiftFormat', () => {
  it('formats closed shift duration in hours and minutes', () => {
    expect(
      getShiftDuration({
        id: 'shift',
        organizationId: 'org',
        employeeId: 'user',
        departmentId: null,
        status: 'CLOSED',
        source: 'WEB',
        startedAt: '2026-06-17T08:00:00.000Z',
        endedAt: '2026-06-17T12:30:00.000Z',
        comment: null,
        employee: {
          id: 'user',
          firstName: 'Петр',
          lastName: 'Иванов',
          middleName: null,
        },
        department: null,
      }),
    ).toBe('4ч 30м');
  });

  it('rounds duration minutes by the common rule', () => {
    expect(formatDurationFromMilliseconds(30_000)).toBe('0ч 1м');
    expect(formatDurationFromMinutes(135.4)).toBe('2ч 15м');
    expect(formatDurationFromMinutes(135.5)).toBe('2ч 16м');
    expect(formatDurationFromHours(2.2583)).toBe('2ч 15м');
    expect(formatDurationFromHours(2.2584)).toBe('2ч 16м');
  });

  it('splits realtime duration into days, hours, minutes, and seconds', () => {
    expect(
      getDurationPartsFromMilliseconds(
        2 * 24 * 60 * 60 * 1_000 +
          3 * 60 * 60 * 1_000 +
          4 * 60 * 1_000 +
          5_999,
      ),
    ).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 5,
    });
  });

  it('formats realtime duration label', () => {
    expect(
      formatDurationPartsLabel({
        days: 0,
        hours: 3,
        minutes: 15,
        seconds: 40,
      }),
    ).toBe('3ч 15м 40с');
    expect(
      formatDurationPartsLabel({
        days: 1,
        hours: 3,
        minutes: 15,
        seconds: 40,
      }),
    ).toBe('1д 3ч 15м 40с');
  });
});
