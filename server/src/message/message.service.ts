import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '@prisma/client';
// import { ChatGateway } from 'src/chat/chat.gateway';
import { ChatService } from 'src/chat/chat.service';


@Injectable()
export class MessageService {
  constructor(
    private readonly prisma : PrismaService,
    private readonly chatService : ChatService,
    // private readonly chatGateWay : ChatGateway
  ) {}

  async createMessage(
    text : string,
    chatId : string,
    senderId : string,
  ) : Promise<Message> {
    // const response = await this.retrieveUsers(chatId);
    // const receivers : string[] = response.userIds
     return this.prisma.message.create({
      data : {
        text,
        chatId,
        senderId,
      }
    });
  }

  async retrieveUsers(
    chatId : string,
  ) : Promise<{userIds : string[]}> {
    const chat = await this.chatService.getChat(chatId);
    if (!chat) {
      console.log("Invalid chat provided");
      throw new Error("Chat not found");
    }

    console.log(chat)



    const users = await this.prisma.chatUser.findMany({
      where : {
        chatId : chat.id
      }
    })


    const userIds : string[] = []

    users.forEach((user) => {
      console.log(user.userId); 
      userIds.push(user.userId)
      // console.log(user.lastReadAt);  
    });

    // console.log(users);
    return {userIds};
  }

  async getMessages(
    chatId : string
  ) : Promise<Message[]> {
    return this.prisma.message.findMany({
        where : {
        chatId : chatId
        }
      }
    )
  }

  async updateMessage(
    messageId : string,
    text : string,
  ) : Promise<Message> {
    return this.prisma.message.update(
      {
        where : {
          id : messageId
        },
        data : {
          text : text
        }
      }
    )
  }

  async deleteMessage(
    messageId : string
  ) : Promise<string> {
    const del = await this.prisma.message.delete(
      {
        where : {
          id : messageId
        }
      }
    )

    if(del)
    {
      return "Message Deleted"
    }
    else{
      return "Message not found"
    }
  }


}
