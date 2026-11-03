import { describe, expect, it } from 'vitest';
import { sanitizeError } from './sanitize-error';

describe('sanitizeError', () => {
  it('redacts PostgreSQL connection URLs', () => {
    expect(sanitizeError(new Error('failed postgresql://user:pass@host/db'))).toBe(
      'failed [redacted]',
    );
  });

  it('redacts Prisma Postgres URLs', () => {
    expect(sanitizeError(new Error('failed prisma+postgres://host/db?api_key=secret'))).toBe(
      'failed [redacted]',
    );
  });

  it('stringifies non-errors', () => {
    expect(sanitizeError('boom')).toBe('boom');
  });
});
