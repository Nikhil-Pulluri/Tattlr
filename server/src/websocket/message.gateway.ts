import {
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { MainGateway } from './websocket.gateway';
import { MessageService } from '../message/message.service';
import { MessageType, MessageStatus, MessageContent } from 'generated/prisma';

@WebSocketGateway()
export class MessageGateway {
  constructor(
    private websocketGateway: MainGateway,
    private messageService: MessageService,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: string;
      senderId: string;
      messageType: MessageType;
      content: MessageContent;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const savedMessage = await this.messageService.createMessage(data);

      this.websocketGateway.emitToRoom(data.conversationId, 'newMessage', {
        id: savedMessage.id,
        senderId: savedMessage.senderId,
        messageType: savedMessage.messageType,
        content: savedMessage.content,
        status: savedMessage.status,
        createdAt: savedMessage.createdAt,
      });

      this.websocketGateway.emitToRoom(data.conversationId, 'userStoppedTyping', {
        userId: data.senderId,
      });
    } catch (error) {
      client.emit('messageError', { error: 'Failed to send message' });
    }
  }

  // @SubscribeMessage('editMessage')
  // async handleEditMessage(
  //   @MessageBody()
  //   data: {
  //     messageId: string;
  //     newContent: MessageContent;
  //     userId: string;
  //     conversationId: string;
  //   },
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   try {
  //     const originalMessage = await this.messageService.getMessageById(data.messageId);

  //     if (!originalMessage || originalMessage.senderId !== data.userId) {
  //       throw new Error('Unauthorized or message not found');
  //     }

  //     // You'd need to create this update method in your MessageService
  //     // const updatedMessage = await this.messageService['prisma'].message.update({
  //     //   where: { id: data.messageId },
  //     //   data: { content: data.newContent },
  //     // });

  //     // this.websocketGateway.emitToRoom(data.conversationId, 'messageEdited', {
  //     //   messageId: updatedMessage.id,
  //     //   newContent: updatedMessage.content,
  //     //   editedAt: updatedMessage.updatedAt,
  //     // });
  //   } catch (error) {
  //     client.emit('editMessageError', { error: error.message || 'Failed to edit message' });
  //   }
  // }

  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody()
    data: { messageId: string; userId: string; conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.messageService.getMessageById(data.messageId);

      if (!message || message.senderId !== data.userId) {
        throw new Error('Unauthorized or message not found');
      }

      await this.messageService.deleteMessage(data.messageId);

      this.websocketGateway.emitToRoom(data.conversationId, 'messageDeleted', {
        messageId: data.messageId,
        deletedBy: data.userId,
      });
    } catch (error) {
      client.emit('deleteMessageError', { error: error.message || 'Failed to delete message' });
    }
  }
}
