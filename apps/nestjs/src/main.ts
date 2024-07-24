import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// import * as cors from 'cors';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const corsConfig: CorsOptions = {
  origin: '*',
  methods: 'GET, PUT, POST, DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors(corsConfig);
  // Enable CORS with options
  // app.use(cors({
  //   origin: 'http://react:2424', // Allow only this origin
  //   methods: ['GET', 'POST'], // Allow only specific HTTP methods
  //   allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  // }));

  await app.listen(4242);
}
bootstrap();
