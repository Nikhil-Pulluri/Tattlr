import { Controller } from '@nestjs/common';
import { MessageService } from './message.service';
import {Get, Post, Body, Put, Delete} from '@nestjs/common/decorators'
import { Public } from 'src/auth/public.decorator';
import { newMessage } from './message.service';
import { Message, MessageStatus } from 'generated/prisma';

@Controller('message')
export class MessageController {
  constructor(
    private messageService : MessageService
  ){}

  @Public()
  @Post('createMessage')
  async createNewMessage(
    @Body() body : newMessage
  ) : Promise<Message> {
    return await this.messageService.createMessage(body)
  }

  @Public()
  @Post('getMessagesByConversationId')
  async getMessagesByConversationId(
    @Body() body : {conversationId : string}
  ) : Promise<Message[]> {
    return await this.messageService.getMessagesByConversationId(body.conversationId)
  }

  @Public()
  @Put('updateMessage')
  async updateMessage(
    @Body() body : {messageId : string, status : MessageStatus}
  ) : Promise<Message | null> {
    return await this.messageService.updateMessageStatus(body.messageId, body.status)
  }

  @Public()
  @Delete('deleteMessage')
  async deleteMessage(
    @Body() body : {messageId : string}
  ) : Promise<Message | null> {
    return await this.messageService.deleteMessage(body.messageId)
  }
}
