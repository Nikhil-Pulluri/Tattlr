import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Chat } from '@prisma/client';
import { Public } from 'src/auth/public.decorator';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService : ChatService) {}

  @Public()
  @Post('create-chat')
  async createChat(
    @Body() data : {
      userIds : string[]
    }
  ) : Promise<Chat> {
    // console.log(data.userIds);
    return this.chatService.createChat(data.userIds)
  }

  @Public()
  @Get('get-chat/:id')
  async getChat(
    @Param('id') id : string
  ) : Promise<Chat> {
    return this.chatService.getChat(id)
  }
}
