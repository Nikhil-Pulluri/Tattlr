import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: ["http://10.1.172.77:3000", "http://localhost:3000"], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept', 
    credentials: true
  };
  app.enableCors(corsOptions);
  await app.listen(process.env.PORT ?? 8000, '0.0.0.0');
}
bootstrap();
