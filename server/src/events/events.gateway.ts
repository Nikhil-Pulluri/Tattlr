import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway(81, { cors: '*', transports: ['websocket'] })
export class EventsGateway {
  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}
