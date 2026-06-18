import { describe, expect, it } from 'vitest';

import { getCorsOrigin } from './env';

describe('env cors config', () => {
  it('allows any request origin when wildcard is configured', () => {
    expect(getCorsOrigin('*')).toBe(true);
  });

  it('parses comma-separated allowed origins', () => {
    expect(getCorsOrigin('http://localhost:3005, https://app.example.com')).toEqual([
      'http://localhost:3005',
      'https://app.example.com',
    ]);
  });
});
