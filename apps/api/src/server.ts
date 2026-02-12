import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CoreModule } from './core.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PORT_DEFAULT, HOST_DEFAULT } from './shared/constants';
import { getConfigNumber } from './shared/config-utils';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);
  const configService = app.get(ConfigService);

  const corsRaw = configService.get<string>('CORS_ORIGINS');
  const corsOrigins = corsRaw?.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : '*',
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nexo API')
    .setDescription('API for tracking VES, Crypto and Forex prices')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('VES', 'Bolívares prices and history')
    .addTag('Crypto', 'Cryptocurrency prices and history')
    .addTag('Forex', 'Fiat currency exchange rates')
    .build();
  
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = getConfigNumber(configService, 'PORT', PORT_DEFAULT);
  const host = configService.get<string>('HOST') ?? HOST_DEFAULT;
  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
