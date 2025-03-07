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

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly userService: UserService) {}

  @WebSocketServer() server: any;

  private clients: Map<string, string> = new Map();

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
  async handleMessage(client: Socket, message: any): Promise<void> {
    const senderId = this.clients.get(client.id);
    if (!senderId) {
      throw new Error("User ID is required.");
    }
  
    const recipientId = message.to;
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
      console.log(`Recipient ${recipientId} is not online`);
    }
  
    await this.sendMessageToDatabase({ userId: senderId, message: message.message });
  }
  

  async onlineUsers(): Promise<void> {
    console.log("called");
    const users: string[] = Array.from(this.clients.values());
    console.log(users);
  }

  async sendMessageToDatabase(data: { userId: string; message: string }): Promise<{ status: string }> {
    return { status: 'success' };
  }
}
