import { Controller, Get, Query } from '@nestjs/common';
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


}
