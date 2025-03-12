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







// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { ChatUser, Chat } from '@prisma/client';

// @Injectable()
// export class ChatService {
//   constructor(private readonly prisma : PrismaService) {}

//   async createChatUser(
//     userId : string,
//     chatId : string
//   ) : Promise<ChatUser> {
//     return this.prisma.chatUser.create(
//       {
//         data : {
//          userId,
//          chatId
//         },
//       }
//     )
//   }

//   async createChat(userIds: string[]): Promise<Chat> {
//     const users = await this.prisma.user.findMany({
//       where: {
//         id: { in: userIds },
//       },
//     });
  
//     // const missingUserIds = userIds.filter(
//     //   (userId) => !users.some((user) => user.id === userId)
//     // );

//     // if (!users || !Array.isArray(users)) {
//     //   throw new Error("Unexpected result from user query.");
//     // }
//     // if (missingUserIds.length) {
//     //   throw new Error(`Users with ids ${missingUserIds.join(', ')} not found`);
//     // }
  
//     const chat = await this.prisma.chat.create({
//       data: {},
//     });
  
//     const chatUsers = userIds.map((userId) => ({
//       userId,
//       chatId: chat.id,
//     }));
  
//     await this.prisma.chatUser.createMany({
//       data: chatUsers,
//     });
  
//     return chat;
//   }
  

//   async getChat(
//     id : string
//   ) : Promise<Chat> {
//     return this.prisma.chat.findUnique(
//       {where : {
//         id : id
//       },
//       include : {
//         users : true
//       }}
//     )
//   }


  
// }
