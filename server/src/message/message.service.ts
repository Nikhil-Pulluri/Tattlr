import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Chat, Message } from '@prisma/client';
import { ChatGateway } from 'src/chat/chat.gateway';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma : PrismaService,
    private readonly chatService : ChatService
  ) {}

  async createMessage(
    text : string,
    chatId : string,
    senderId : string,
  ) : Promise<Message> {
    return this.prisma.message.create({
      data : {
        text,
        chatId,
        senderId,
      }
    });
  }

  async sendMessage(
    message : string,
    chatId : string,
    senderId : string,
  ) : Promise<{message : string}> {
    const chat : Chat = await this.chatService.getChat(chatId);
    if(!chat)
    {
      console.log("invalid chat provided");
    }

    const {users} = chat;


    return {
      message : "message sent successfully"
    }
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
