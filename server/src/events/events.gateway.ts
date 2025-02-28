import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

@WebSocketGateway(81)
export class EventsGateway {
  @SubscribeMessage('message')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }
}
