import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── CORS ──────────────────────────────────────────────
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'https://ubucuruzi.vercel.app', // your actual frontend URL
      'https://ubucuruzi.vercel.app/', // with slash just in case
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // we use JWT tokens, no cookies
  });

  // ── Validation ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on port ${port}`);
}
bootstrap();

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe, BadRequestException  } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
  
//   // Enable validation globally
//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       transform: true,
//       exceptionFactory: (errors) => {
//         console.error('Validation errors:', JSON.stringify(errors, null, 2));
//         return new BadRequestException(errors);
//       },
//     }),
//   );
  
//   // Enable CORS for frontend
//   app.enableCors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' });

//   const port = process.env.PORT || 4000;
//   await app.listen(port);
//   console.log(`🚀 Backend running on http://localhost:${port}`);
// }
// bootstrap();