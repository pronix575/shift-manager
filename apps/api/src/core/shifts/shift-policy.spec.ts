import { describe, expect, it } from 'vitest';

import { canEmployeeEditShift } from './shift-policy';

describe('shift-policy', () => {
  const now = new Date('2026-06-17T12:00:00.000Z');

  it('allows editing open shifts', () => {
    expect(
      canEmployeeEditShift({ status: 'OPEN', endedAt: null }, 1, now),
    ).toBe(true);
  });

  it('allows editing closed shifts when limit is null', () => {
    expect(
      canEmployeeEditShift(
        { status: 'CLOSED', endedAt: new Date('2026-01-01T00:00:00.000Z') },
        null,
        now,
      ),
    ).toBe(true);
  });

  it('denies editing closed shifts after limit', () => {
    expect(
      canEmployeeEditShift(
        { status: 'CLOSED', endedAt: new Date('2026-06-17T10:00:00.000Z') },
        30,
        now,
      ),
    ).toBe(false);
  });
});
