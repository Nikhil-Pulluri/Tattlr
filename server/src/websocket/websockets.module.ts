import { Module } from '@nestjs/common';
import { MainGateway } from './websocket.gateway';
import { MessageModule } from 'src/message/message.module';
import { ConnectionService } from './services/connection.service';
import { ConversationModule } from 'src/conversation/conversation.module';
import { RoomGateway } from './room.gateway';
import { MessageGateway } from './message.gateway';

@Module({
  imports : [MessageModule, ConversationModule],
  providers: [MainGateway, ConnectionService, RoomGateway, MessageGateway]
})
export class WebsocketsModule {}
