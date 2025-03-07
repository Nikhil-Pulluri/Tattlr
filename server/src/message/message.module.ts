import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [MessageService, PrismaService],
  controllers: [MessageController],
  imports : [UserModule]
})
export class MessageModule {}
