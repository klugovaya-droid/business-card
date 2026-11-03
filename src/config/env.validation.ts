const DEFAULT_PORT = 3000;

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const databaseUrl = config.DATABASE_URL;

  if (typeof databaseUrl !== 'string' || databaseUrl.trim() === '') {
    throw new Error('DATABASE_URL is required');
  }

  const port = Number(config.PORT ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return { ...config, PORT: port };
}
