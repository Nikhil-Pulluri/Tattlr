import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketServer,
} from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
// import { MessageService } from 'src/message/message.service';

@WebSocketGateway({ namespace: '/chat',
                    cors: {
                      origin: '*',
                      credentials: true,
                    }, },)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly userService: UserService) {}

  @WebSocketServer() server: any;

  private clients: Map<string, string> = new Map(); // cleintId -> userId

  @SubscribeMessage('join')
  async handleJoin(client: Socket, message: any): Promise<void> {
    if (!message.userId) {
      throw new Error("User ID is required.");
    }

    this.clients.set(client.id, message.userId);
    const user: User = await this.userService.getUser({ id: message.userId });
    await this.onlineUsers();
    this.server.emit('join', `${user.username} joined`);
  }
  
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    if (this.clients.has(client.id)) {
      console.log(`Client ${client.id} is already connected.`);
      return;
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = this.clients.get(client.id);
    if (userId) {
      this.clients.delete(client.id);
      this.server.emit('leave', `User ${userId} left`);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, message: {userIds : string[], message : string}): Promise<void> {
    const senderId = this.clients.get(client.id);
    if (!senderId) {
      throw new Error("User ID is required.");
    }


    for(const userId of message.userIds) 
    {
      if(userId !== senderId)
      {
        const recipientId = userId;
        if (!recipientId) {
          throw new Error("Recipient ID is required.");
        }
      
        let recipientSocketId: string | undefined;
        for (const [socketId, userId] of this.clients) {
          if (userId === recipientId) {
            recipientSocketId = socketId;
            break;
          }
        }
      
        if (recipientSocketId) {
          this.server.to(recipientSocketId).emit('message', message.message);
        } else {
          this.server.to(senderId).emit('exception', `${recipientId}`);
        }

      }
    }


  
  }

  @SubscribeMessage('typing')
  async handleTyping(client: Socket, message: any): Promise<void> {
    const senderId = this.clients.get(client.id);
    // console.log(senderId)
    // if (!senderId) {
    //   throw new Error("User ID is required.");
    // }
    const receiverId = this.getSocketIdByUserId(message.receiver);
    // console.log(receiverId)
    // console.log("typing")
    this.server.to(receiverId).emit('typing', senderId);
  }

  getSocketIdByUserId(userId: string): string | undefined {
    for (const [socketId, storedUserId] of this.clients) {
      if (storedUserId === userId) {
        return socketId; // Return the socketId if userId matches
      }
    }
    return undefined; // Return undefined if userId is not found
  }


  

  async onlineUsers(): Promise<void> {
    console.log("called");
    const users: string[] = Array.from(this.clients.values());
    console.log(users);
  }

}
