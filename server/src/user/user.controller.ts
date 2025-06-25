import { Controller, Get, Query, Body, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { Public } from 'src/auth/public.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) {}
  
  @Public()
  @Get('search')
  async searchUsers(
    @Query('username') username: string
  ) : Promise<User[]>{
    return await this.userService.getUsersByUsername(username)
  }

  @Public()
  @Get('getUserById')
  async getMyUser(
    @Query('userId') userId : string
  ) : Promise<User>{
    return await this.userService.getUserbyId(userId)
  }

  @Public()
  @Post('getUsersBatched')
  async getUsersBatched(
    @Body() body : {userIds : string[]}
  ) {
    return await this.userService.getUserNamesInBatch(body.userIds)
  }
}
