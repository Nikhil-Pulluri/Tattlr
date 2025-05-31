import {
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from './websocket.gateway';
import { ConversationService as RoomService } from '../conversation/conversation.service';
import { ConnectionService } from './services/connection.service';

@WebSocketGateway()
export class RoomGateway {
  constructor(
    private websocketGateway: MainGateway,
    private roomService: RoomService,
    private connectionService: ConnectionService,
  ) {}

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const temp = await this.roomService.validateConversation(data.conversationId, data.userId);

      // console.log(temp)
      
      if(temp){
        client.join(data.conversationId);
        this.connectionService.addUserToRoom(data.userId, data.conversationId);
        
        const onlineUsers = this.connectionService.getRoomUsers(data.conversationId);
        
        this.websocketGateway.emitToRoom(data.conversationId, 'userJoined', {
          userId: data.userId,
          onlineUsers,
        });
        
        client.emit('roomJoined', {
          roomId: data.conversationId,
          onlineUsers,
        });
      }

      else {
        client.emit('joinRoomError', { error: 'Unauthorized' });
        console.log("unauthorized access to this room")
      }
      
    } catch (error) {
      client.emit('joinRoomError', { error: error.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.conversationId);
    this.connectionService.removeUserFromRoom(data.userId, data.conversationId);
    
    this.websocketGateway.emitToRoom(data.conversationId, 'userLeft', {
      userId: data.userId,
      onlineUsers: this.connectionService.getRoomUsers(data.conversationId),
    });
  }

  // @SubscribeMessage('getRoomInfo')
  // async handleGetRoomInfo(
  //   @MessageBody() data: { conversationId: string },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   try {
  //     const roomInfo = await this.roomService.getRoomInfo(data.conversationId);
  //     const onlineUsers = this.connectionService.getRoomUsers(data.conversationId);
      
  //     client.emit('roomInfo', {
  //       ...roomInfo,
  //       onlineUsers,
  //     });
  //   } catch (error) {
  //     client.emit('getRoomInfoError', { error: error.message });
  //   }
  // }
}
