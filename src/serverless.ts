import { IncomingMessage, ServerResponse } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

interface ServerlessApp {
  app: INestApplication;
  server: Express;
}

let appPromise: Promise<ServerlessApp> | undefined;

async function createApp(): Promise<ServerlessApp> {
  const server = express();
  const adapter = new ExpressAdapter(server);
  const app = await NestFactory.create(AppModule, adapter);

  configureApp(app);
  await app.init();

  return { app, server };
}

async function getApp(): Promise<ServerlessApp> {
  appPromise ??= createApp().catch((error: unknown) => {
    appPromise = undefined;
    throw error;
  });

  return appPromise;
}

export function createHandler(path: string) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      const { server } = await getApp();

      req.url = path;
      server(req as Request, res as Response);
    } catch (error) {
      console.error('[business-card] serverless init failed', error);

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ error: 'SERVERLESS_INIT_FAILED' }));
      }
    }
  };
}

export async function closeServerlessApp(): Promise<void> {
  if (!appPromise) {
    return;
  }

  const { app } = await appPromise;
  await app.close();
  appPromise = undefined;
}
