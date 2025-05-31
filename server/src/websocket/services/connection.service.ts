import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ConnectionService {
  private connections = new Map<string, Socket>(); // socketId -> Socket
  private userSockets = new Map<string, string>(); // userId -> socketId
  private roomUsers = new Map<string, Set<string>>(); // roomId -> Set<userId>

  addConnection(client: Socket) {
    this.connections.set(client.id, client);
  }

  removeConnection(client: Socket) {
    this.connections.delete(client.id);
    
    // Remove user from userSockets
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  addUserToRoom(userId: string, roomId: string) {
    if (!this.roomUsers.has(roomId)) {
      this.roomUsers.set(roomId, new Set());
    }
    console.log(this.roomUsers[roomId])
    this.roomUsers.get(roomId).add(userId);
  }

  removeUserFromRoom(userId: string, roomId: string) {
    if (this.roomUsers.has(roomId)) {
      this.roomUsers.get(roomId).delete(userId);
      if (this.roomUsers.get(roomId).size === 0) {
        this.roomUsers.delete(roomId);
      }
    }
  }

  getRoomUsers(roomId: string): string[] {
    return Array.from(this.roomUsers.get(roomId) || []);
  }

  getUserSocket(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }
}
