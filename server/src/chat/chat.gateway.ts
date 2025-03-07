import { SubscribeMessage, WebSocketGateway, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
// import the meessge service after developing it

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly userService : UserService) {}

  @WebSocketServer()
  server;

  private clients : Map<string, string> = new Map();

  @SubscribeMessage('join')
  async handleJoin(client : Socket , message) : Promise<void> {

    // console.log(message);
    // console.log(client.id);
    // console.log(message.userId)
    if (!message.userId) {
      throw new Error("User ID is required.");
    }

    this.clients.set(client.id, message.userId)
    const user : User = await this.userService.getUser({id : message.userId})
    await this.onlineUsers()
    this.server.emit('join', `${user.username} joined`)

    // return `${user.username} joined`
  }
  




  // @SubscribeMessage('message')
  // handleMessage(@MessageBody() data : {
  //   clientId : string,
  //   message : string,
  // }): string {
    
  // }


  async onlineUsers() : Promise<void> {
    console.log("called")
    const users : string[] = Array.from(this.clients.values())

    console.log(users) ;
  }

  async sendMessageToDatabase(data : {
    userId : string,
    message : string
  }) : Promise<{status : string}> {
    return {
      status : 'success' // change it later using database shit
    }
  }
}
