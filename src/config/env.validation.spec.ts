import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('accepts a valid environment and normalizes the port', () => {
    expect(
      validateEnv({ DATABASE_URL: 'postgresql://localhost/db', PORT: '4000' }),
    ).toMatchObject({
      DATABASE_URL: 'postgresql://localhost/db',
      PORT: 4000,
    });
  });

  it('uses the default port when PORT is missing', () => {
    expect(validateEnv({ DATABASE_URL: 'postgresql://localhost/db' })).toMatchObject({
      PORT: 3000,
    });
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow('DATABASE_URL is required');
  });

  it('rejects an invalid PORT', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'postgresql://localhost/db', PORT: 'abc' }),
    ).toThrow('PORT must be an integer between 1 and 65535');
  });
});
