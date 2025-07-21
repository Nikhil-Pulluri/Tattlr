import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { WebsocketsModule } from './websocket/websockets.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, ConversationModule, MessageModule, WebsocketsModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
