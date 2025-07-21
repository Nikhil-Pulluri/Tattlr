// webrtc.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectionService } from './services/connection.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class WebRtcGateway{
  @WebSocketServer()
  server: Server;

  constructor(private readonly connectionService: ConnectionService) {}


  // === WebRTC Signaling Handlers ===

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, payload: { roomId: string; userId: string }) {
    client.join(payload.roomId);
    client.to(payload.roomId).emit('user-joined', {
      userId: payload.userId,
      socketId: client.id,
    });
  }

  @SubscribeMessage('webrtc-offer')
  handleOffer(client: Socket, payload: { target: string; offer: RTCSessionDescriptionInit; roomId: string }) {
    client.to(payload.target).emit('webrtc-offer', {
      offer: payload.offer,
      sender: client.id,
    });
  }

  @SubscribeMessage('webrtc-answer')
  handleAnswer(client: Socket, payload: { target: string; answer: RTCSessionDescriptionInit }) {
    client.to(payload.target).emit('webrtc-answer', {
      answer: payload.answer,
      sender: client.id,
    });
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleIceCandidate(client: Socket, payload: { target: string; candidate: RTCIceCandidateInit }) {
    client.to(payload.target).emit('webrtc-ice-candidate', {
      candidate: payload.candidate,
      sender: client.id,
    });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    client.to(payload.roomId).emit('user-left', { socketId: client.id });
    client.leave(payload.roomId);
  }

  // === Utility Emit Methods ===

  emitToRoom(roomId: string, event: string, payload: any): void {
    this.server.to(roomId).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: any): void {
    const socketId = this.connectionService.getUserSocket(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, payload);
    }
  }

  emitToAll(event: string, payload: any): void {
    this.server.emit(event, payload);
  }
}
