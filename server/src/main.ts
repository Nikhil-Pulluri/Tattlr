import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const corsOptions = {
    origin: "*",  
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',  
    credentials: true,  
  };

  app.enableCors(corsOptions);  
  await app.listen(process.env.PORT ?? 8000, '0.0.0.0');
}

bootstrap();
