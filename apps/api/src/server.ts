import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);

  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : '*',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Nexo API')
    .setDescription('API for tracking VES, Crypto and Forex prices')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('VES', 'Bolívares prices and history')
    .addTag('Crypto', 'Cryptocurrency prices and history')
    .addTag('Forex', 'Fiat currency exchange rates')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0'; // 0.0.0.0 para que el móvil en la red local pueda conectarse
  await app.listen(port, host);
  console.log(`Application is running on: http://${host}:${port}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
