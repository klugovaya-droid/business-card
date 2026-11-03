import { Logger } from '@nestjs/common';
import { GraphQLFormattedError } from 'graphql';

const logger = new Logger('GraphQL');

export function formatGraphqlError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const code = formattedError.extensions?.code;

  if (code === 'INTERNAL_SERVER_ERROR') {
    logger.error(formattedError.message, error instanceof Error ? error.stack : undefined);

    return {
      message: 'Internal server error',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
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
