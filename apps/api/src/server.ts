import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Nexo API')
    .setDescription('API for tracking VES, Crypto and Forex prices')
    .setVersion('1.0')
    .addTag('VES', 'Bolívares prices and history')
    .addTag('Crypto', 'Cryptocurrency prices and history')
    .addTag('Forex', 'Fiat currency exchange rates')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger docs available at: ${await app.getUrl()}/api/docs`);
}
bootstrap();
