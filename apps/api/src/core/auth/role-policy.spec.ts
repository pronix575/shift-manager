import { describe, expect, it } from 'vitest';

import { UserRole } from 'generated/prisma/enums';

import { canWorkWithOwnShifts } from './role-policy';

describe('role-policy', () => {
  it('allows employees and organization managers to work with own shifts', () => {
    expect(canWorkWithOwnShifts(UserRole.EMPLOYEE)).toBe(true);
    expect(canWorkWithOwnShifts(UserRole.ORG_MANAGER)).toBe(true);
  });

  it('keeps admins out of own-shift employee flow', () => {
    expect(canWorkWithOwnShifts(UserRole.ADMIN)).toBe(false);
  });
});
