import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: ["http://10.1.172.77:3000", "http://localhost:3000", "https://tattlr.vercel.app"], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept', 
    credentials: true
  };
  app.enableCors(corsOptions);
  await app.listen(80, '0.0.0.0');
}
bootstrap();
