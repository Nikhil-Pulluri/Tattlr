import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from 'src/user/user.module';
import { PrismaService } from 'src/prisma/prisma.service';
// import the message module after developing it

@Module({
  providers: [ChatGateway, ChatService, PrismaService], // import the message service after developing it
  controllers: [ChatController],
  imports : [UserModule],
  exports : [ChatService, ChatGateway]

})
export class ChatModule {}
