import { describe, expect, it } from 'vitest';

import { buildLoginBase, getLoginCandidate } from './login-generator';

describe('login-generator', () => {
  it('transliterates russian last name and first name initial', () => {
    expect(buildLoginBase('Иванов', 'Петр')).toBe('ivanovp');
  });

  it('normalizes punctuation and falls back to user', () => {
    expect(buildLoginBase('---', '')).toBe('user');
  });

  it('adds numeric suffix only for duplicate candidates', () => {
    expect(getLoginCandidate('ivanovp', 1)).toBe('ivanovp');
    expect(getLoginCandidate('ivanovp', 2)).toBe('ivanovp2');
  });
});
