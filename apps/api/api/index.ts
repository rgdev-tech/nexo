import { NestFactory } from '@nestjs/core';
import { CoreModule } from '../src/core.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const config = {
  api: {
    bodyParser: false,
  },
};

let appPromise: Promise<any>;

const createNestServer = async (expressInstance: any) => {
  const app = await NestFactory.create(
    CoreModule,
    new ExpressAdapter(expressInstance),
    { logger: ['error', 'warn'] } // Reduce logs in prod
  );
  app.enableCors();
  await app.init();
  return app;
};

export default async (req: any, res: any) => {
  try {
    if (!appPromise) {
      appPromise = createNestServer(server);
    }
    await appPromise;
    server(req, res);
  } catch (err) {
    console.error('NestJS Serverless Init Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: String(err) });
  }
};
