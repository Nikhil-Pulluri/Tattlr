import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma : PrismaService
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
