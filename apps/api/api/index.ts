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
  );
  app.enableCors();
  await app.init();
  return app;
};

export default async (req: any, res: any) => {
  if (!appPromise) {
    appPromise = createNestServer(server);
  }
  await appPromise;
  server(req, res);
};
