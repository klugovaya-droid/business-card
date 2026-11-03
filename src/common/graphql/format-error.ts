import { Logger } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';
import { sanitizeError } from '../errors/sanitize-error';

const logger = new Logger('GraphQL');

export function formatGraphqlError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const code = formattedError.extensions?.code;

  if (code === 'INTERNAL_SERVER_ERROR') {
    logger.error(formattedError.message, error instanceof Error ? error.stack : undefined);

    const exposeDetails =
      process.env.DEBUG_ERRORS === 'true' ||
      (process.env.VERCEL === '1' && process.env.DEBUG_ERRORS !== 'false');

    return {
      message: 'Internal server error',
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        ...(exposeDetails ? { details: sanitizeError(error) } : {}),
      },
    };
  }

  return {
    ...formattedError,
    extensions: {
      ...formattedError.extensions,
      code: typeof code === 'string' ? code : 'BAD_REQUEST',
    },
  };
}
