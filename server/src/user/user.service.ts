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
}
