import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Prisma} from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma : PrismaService){}

  async createUser(data : {
    name :string,
    email : string,
    username : string,
    password : string,
    phnum : string,
  }) : Promise <User>{
    const saltRounds = 10;
    const hashedpass = await bcrypt.hash(data.password, saltRounds);
    
    return this.prisma.user.create({
      data : {
        ...data,
        password : hashedpass,
      }
    });
  }


  async getUser(data: { id: string }): Promise<User> {
    return this.prisma.user.findUnique({
      where: {
        id: data.id, // The ID of the user to retrieve
      },
      include: {
        // Include all related chats
        chats: {
          include: {
            // Include the chat and its related users
            chat: {
              include: {
                // Include all users in this chat
                users: {
                  include: {
                    user: true, // Include the user related to each chatUser
                  },
                },
                // If you also want to include the messages and typing statuses
                messages: true, // Optionally include messages in each chat
              },
            },
          },
        },
        // Optionally include other related fields from the User model
        messages: true, // Include the messages read by the user
      },
    });
  }
  

  async validateUser(data: Prisma.UserWhereUniqueInput): Promise<User> {
    const conditions = [];
    if (data.email) conditions.push({ email: data.email });
    if (data.username) conditions.push({ username: data.username });
    if (data.phnum) conditions.push({ phnum: data.phnum });
  
    return this.prisma.user.findFirst({
      where: {
        OR: conditions.length ? conditions : undefined
      }
    });
  }
  
}
