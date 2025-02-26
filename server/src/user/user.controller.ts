import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { Public } from 'src/auth/public.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService : UserService){}

  @Public()
  @Post('create')
  async createUser(
    @Body() data: {
    email : string,
    name  : string,
    username : string,
    password : string,
    phnum : string,
  }) : Promise<User>{
    return this.userService.createUser(data);
  }

  
  @Get(':id')
  async getUser(
    @Param('id')  id : string
  ) : Promise<User> {
    return this.userService.getUser({id})
  }


}
