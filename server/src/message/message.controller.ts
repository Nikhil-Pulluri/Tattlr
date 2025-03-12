import { Controller, Post, Put,  Get, Delete, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';
import { UserService } from 'src/user/user.service';
import { Message } from '@prisma/client';
import { Public } from 'src/auth/public.decorator';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messageService : MessageService,
    private readonly userService : UserService
  ) {}

  @Public()
  @Post('create')
  async createMessage(
    @Body() data : {
      text : string,
      chatId : string,
      senderId : string,
    }
  ) : Promise<Message> {
    return this.messageService.createMessage(
      data.text,
      data.chatId,
      data.senderId
    )
  }

  @Public()
  @Get('retrieve/:id')
  async retrievUsers(
    @Param('id') id : string  
  ) : Promise<{userIds : string[]}>
  {
    return this.messageService.retrieveUsers(id)
  }

  
  @Put('update/:id')
  async updateMessage(
    @Param('id') id : string,
    @Body() data : {
      text : string
    }
  ) : Promise<Message>{
    return this.messageService.updateMessage(
      id,
      data.text
    )
  }

  @Delete('delete/:id')
  async deleteMessage(
    @Param('id') id : string
  ) : Promise<string> {
    return this.deleteMessage(id)
  }

}
