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

  it('accepts POSTGRES_URL as a Vercel Postgres fallback', () => {
    expect(validateEnv({ POSTGRES_URL: 'postgresql://postgres@vercel/db' })).toMatchObject({
      DATABASE_URL: 'postgresql://postgres@vercel/db',
    });
  });

  it('accepts direct URL fallbacks when only they are configured', () => {
    expect(
      validateEnv({
        POSTGRES_URL_NON_POOLING: 'postgresql://postgres@vercel/direct',
      }),
    ).toMatchObject({
      DATABASE_URL: 'postgresql://postgres@vercel/direct',
    });
  });

  it('prefers DATABASE_URL over POSTGRES_URL', () => {
    expect(
      validateEnv({
        DATABASE_URL: 'postgresql://primary/db',
        POSTGRES_URL: 'postgresql://fallback/db',
      }),
    ).toMatchObject({
      DATABASE_URL: 'postgresql://primary/db',
    });
  });

  it('rejects a missing database URL', () => {
    expect(() => validateEnv({})).toThrow('A PostgreSQL connection URL is required');
  });

  it('rejects an invalid PORT', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'postgresql://localhost/db', PORT: 'abc' }),
    ).toThrow('PORT must be an integer between 1 and 65535');
  });
});
