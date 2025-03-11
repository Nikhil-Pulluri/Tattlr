import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ChatService } from 'src/chat/chat.service';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [MessageService, PrismaService, ChatGateway, ChatService],
  controllers: [MessageController],
  imports : [UserModule, ChatModule]
})
export class MessageModule {}
