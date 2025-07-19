import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const CORS_ORIGIN = process.env.CORS_ORIGIN || '';
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // Configuración de CORS
  let corsOrigins: string[] | boolean;

  if (NODE_ENV === 'development') {
    // En desarrollo, permitir todos los orígenes
    corsOrigins = true;
  } else if (CORS_ORIGIN) {
    // En producción, usar los orígenes especificados
    corsOrigins = CORS_ORIGIN.split(',').map((origin) => origin.trim());
  } else {
    // Si no hay CORS_ORIGIN configurado, usar orígenes por defecto
    corsOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  }

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('Ecommerce API NestJS')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
