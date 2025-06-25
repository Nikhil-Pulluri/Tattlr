import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsersByUsername(username: string): Promise<User[]> {
    const usersFound = await this.prisma.user.findMany({
      where: {
        username: {
          startsWith: username,
          mode: 'insensitive', 
        },
      },
      take: 10, 
      orderBy: {
        username: 'asc',
      },
    });

    return usersFound;
  }

  async getUserbyId(userId: string): Promise<User> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }
  
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
  
      if (!user) {
        throw new Error(`User not found with ID: ${userId}`);
      }
  
      return user;
    } catch (error) {
      console.error(`getUserbyId() failed for ID=${userId}`, error);
      throw error;
    }
  }

  async getUserNamesInBatch(userIds : string[]) : Promise<Record<string, string>> {
    const userMap : Record<string, string> = {}
    try{
      const users = await this.prisma.user.findMany({
        where : {
          id : {
            in : userIds
          }
        },
        select : {
          id : true,
          name : true
        }
      })

      users.forEach(user => {
        userMap[user.id] = user.name
      });

      return userMap
    }catch(error){
      console.log(error);
      throw error
    }
  }
  
}
