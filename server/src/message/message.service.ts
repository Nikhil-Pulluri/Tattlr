import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageType, MessageStatus, MessageContent, Message } from 'generated/prisma';

export interface newMessage{
  conversationId : string,
  senderId : string,
  messageType : MessageType,
  contest : MessageContent,
}

@Injectable()
export class MessageService {
  constructor(
    private prisma : PrismaService
  ){}

  async createMessage(
    props : newMessage
  ) : Promise<Message> {
    try{
      const message = await this.prisma.message.create({
        data : {
          conversationId : props.conversationId,
          senderId : props.senderId,
          messageType : props.messageType,
          status : MessageStatus.SENT,
          content : props.contest
        }
      })

      if(message) return message
    }catch(error){
      console.log("message creation failed", error)
      throw error
    }
  }

  async getMessagesByConversationId(
    conversationId : string
  ) : Promise<Message[]> {
    try{
      const messages = await this.prisma.message.findMany({
        where : {
          conversationId
        },
        orderBy : {
          createdAt : 'asc'
        }
      })

      return messages
    }catch(error){
      console.log("failed to fetch messages", error)
      throw error
    }
  }

  async getMessageById(
    messageId : string
  ) : Promise<Message | null> {
    try{
      const message = await this.prisma.message.findUnique({
        where : {
          id : messageId
        }
      })

      return message
    }catch(error){
      console.log("failed to fetch message by id", error)
      throw error
    }
  }

  async updateMessageStatus(
    messageId : string,
    status : MessageStatus
  ) : Promise<Message | null> {
    try{
      const updatedMessage = await this.prisma.message.update({
        where : {
          id : messageId
        },
        data : {
          status
        }
      })

      return updatedMessage
    }catch(error){
      console.log("failed to update message status", error)
      throw error
    }
  }

  async deleteMessage(
    messageId : string
  ) : Promise<Message | null> {
    try{
      const deletedMessage = await this.prisma.message.delete({
        where : {
          id : messageId
        }
      })

      return deletedMessage
    }catch(error){
      console.log("failed to delete message", error)
      throw error
    }
  }

  async deleteMessagesByConversationId(
    conversationId : string
  ) : Promise<{status : string}> {
    try{
      const deletedMessages = await this.prisma.message.deleteMany({
        where : {
          conversationId
        }
      })
      if(deletedMessages) return {status : "messages deleted successfully"}
    }catch(error){
      console.log("failed to delete messages by conversation id", error)
      throw error
    }
  }
}
