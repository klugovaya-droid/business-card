import { INestApplication } from '@nestjs/common';

function corsOrigin(): boolean | string[] {
  const configured = process.env.CORS_ORIGIN;

  if (!configured || configured === '*') {
    return true;
  }

  return configured.split(',').map((origin) => origin.trim());
}

export function configureApp(app: INestApplication): void {
  app.enableShutdownHooks();
  app.enableCors({ origin: corsOrigin() });
}
