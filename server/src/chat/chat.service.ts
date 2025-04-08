import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatUser, Chat } from '@prisma/client';



@Injectable()
export class ChatService {
  constructor(private readonly prisma : PrismaService) {}

  async createChatUser(
    userId : string,
    chatId : string
  ) : Promise<ChatUser> {
    return this.prisma.chatUser.create(
      {
        data : {
         userId,
         chatId
        },
      }
    )
  }

  async createChat(
    userIds : string[],
  ) : Promise<Chat> {
    const chat = await this.prisma.chat.create(
      {
        data : {}
      }
    )
    for(const userId of userIds){
      const user = await this.prisma.user.findUnique(
        {
          where : {
            id : userId
          }
        }
      )
      if(!user)
      {
        throw new Error(`User with id ${userId} not found`);
      }
      const chatUser = await this.createChatUser(
        userId,
        chat.id
      )
    } 

    return chat
  }

  async getMyChats(
    userId : string,
  ) : Promise<ChatUser[]>{
    return this.prisma.chatUser.findMany(
      {
        where : {
          userId : userId
        },
        include : {
          chat : true,
          user : true
        }
      }
    )
  }


  async getChat(
    id : string
  ) : Promise<Chat> {
    return this.prisma.chat.findUnique(
      {where : {
        id : id
      },
      include : {
        users : true
      }}
    )
  }



  
}



