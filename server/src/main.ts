import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const corsOptions = {
    origin: ['https://yourfrontend.com'],  
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',  
    credentials: true,  
  };

  app.enableCors(corsOptions);  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
