const DEFAULT_PORT = 3000;
const DATABASE_URL_KEYS = ['DATABASE_URL', 'POSTGRES_URL'] as const;

function resolveDatabaseUrl(config: Record<string, unknown>): string | undefined {
  for (const key of DATABASE_URL_KEYS) {
    const value = config[key];

    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
  }

  return undefined;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const databaseUrl = resolveDatabaseUrl(config);

  if (!databaseUrl) {
    throw new Error('DATABASE_URL or POSTGRES_URL is required');
  }

  const port = Number(config.PORT ?? DEFAULT_PORT);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return { ...config, DATABASE_URL: databaseUrl, PORT: port };
}
