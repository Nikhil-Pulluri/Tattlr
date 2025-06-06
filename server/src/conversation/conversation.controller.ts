import { Controller } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import {Post, Get, Body, Delete} from '@nestjs/common/decorators'
import { Public } from 'src/auth/public.decorator';
import { decideConversation, newParticipant } from './conversation.service';
import { Conversation } from 'generated/prisma';

@Controller('conversation')
export class ConversationController {
  constructor(
    private conversationService : ConversationService
  ){}
  
  @Public()
  @Post('createConversation')
  async createConversation(
    @Body() props : decideConversation
  ) : Promise<{status : string}> {
    return await this.conversationService.populateCoversation(props)
  }

  @Public()
  @Post('addUsertoAConversation')
  async addUsertoAConversation(
    @Body() props : newParticipant
  ) : Promise<{status : string}> {
    return await this.conversationService.addUsertoAConversation(props)
  }

  @Public()
  @Post('getUserConversations')
  async getUserConversations(
    @Body() body : {userId : string}
  ) : Promise<Conversation[]> {
    return await this.conversationService.getUserConversations(body.userId)
  }

  @Public()
  @Delete('deleteConversation')
  async deleteConversation(@Body() body : {conversationId : string}) : Promise<{status : string}> {
    return await this.conversationService.deleteConversation(body.conversationId)
  }


  
}
