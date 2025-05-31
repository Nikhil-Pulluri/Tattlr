import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectionService } from './services/connection.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class MainGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly connectionService: ConnectionService) {}

  // Lifecycle: when a client connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectionService.addConnection(client);
  }

  // Lifecycle: when a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectionService.removeConnection(client);
  }

  // === Utility Emit Methods ===

  /**
   * Emit an event to a specific room (e.g., conversation or group)
   */
  emitToRoom(roomId: string, event: string, payload: any): void {
    this.server.to(roomId).emit(event, payload);
  }

  /**
   * Emit an event directly to a specific user via their socket ID
   */
  emitToUser(userId: string, event: string, payload: any): void {
    const socketId = this.connectionService.getUserSocket(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }

  /**
   * Emit an event globally to all connected clients
   */
  emitToAll(event: string, payload: any): void {
    this.server.emit(event, payload);
  }
}
