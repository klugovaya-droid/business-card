import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { formatGraphqlError } from './format-error';

describe('formatGraphqlError', () => {
  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('hides internal errors', () => {
    const result = formatGraphqlError(
      { message: 'database exploded', extensions: { code: 'INTERNAL_SERVER_ERROR' } },
      new Error('database exploded'),
    );

    expect(result).toEqual({
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('preserves client errors', () => {
    const result = formatGraphqlError(
      {
        message: 'Syntax Error: ...',
        locations: [{ line: 1, column: 2 }],
        extensions: { code: 'GRAPHQL_PARSE_FAILED' },
      },
      new Error('syntax'),
    );

    expect(result.message).toBe('Syntax Error: ...');
    expect(result.extensions?.code).toBe('GRAPHQL_PARSE_FAILED');
    expect(result.locations).toEqual([{ line: 1, column: 2 }]);
  });
});
