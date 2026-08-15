import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException  } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.error('Validation errors:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );
  
  // Enable CORS for frontend
  app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();