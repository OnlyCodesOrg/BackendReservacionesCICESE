import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Backend Reservaciones CICESE')
    .setDescription('API for managing reservations at CICESE')
    .setVersion('1.0')
    .addTag('reservations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://app-reservaciones-cicese.ambitioussea-007d0918.westus3.azurecontainerapps.io',
          'https://cicese.isyte.dev',
        ]
      : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
