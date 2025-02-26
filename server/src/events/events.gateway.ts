import { WebSocketGateway, SubscribeMessage, MessageBody } from "@nestjs/websockets";

@WebSocketGateway(80, { namespace: 'events' })
export class EventsGateway {
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data:string): string {
    return data;
  }
}


