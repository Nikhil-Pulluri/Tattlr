import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConversationType, Conversation, ParticipantRole, ConversationParticipant, MessageContent, MessageType } from 'generated/prisma';
import { MessageService } from 'src/message/message.service';


export interface newConversation {
  type : ConversationType,
  name? : string,
  description? : string,
  groupImage? : string,
  participantCount : number,
}

export interface newParticipant {
  conversationId : string,
  userId : string,
  role? : ParticipantRole,
  nickname? :string,
}

export interface decideConversation{
  userIds : string[],
  type : ConversationType
  name? : string,
  description? : string
  groupImage? : string
}

@Injectable()
export class ConversationService {
  constructor(
    private prisma : PrismaService,
    @Inject(forwardRef(() => MessageService))
    private messageService : MessageService
  ){}

  async createConversation(
    props : newConversation
  ) : Promise<Conversation> {
      try{
        const conversation = await this.prisma.conversation.create(
          {
            data : {
              type : props.type,
              name : props.name,
              description : props.description,
              groupImage : props.groupImage,
              participantCount : props.participantCount
            }
          }
        )

        return conversation
      }catch(error){
        console.log("conversation creation failed", error)
      }
  }

  async createParticipant(props: newParticipant): Promise<ConversationParticipant> {
    if (!props?.userId) throw new Error('User ID is required');

    try {
      const participant = await this.prisma.conversationParticipant.create({
        data: {
          conversationId : props.conversationId,
          userId: props.userId,
          role: props.role,
          nickname: props.nickname,
        },
      });

      return participant;
    } catch (error) {
      console.error('Participant creation failed:', error);
      throw error;
    }
  }


  async populateCoversation(
    props : decideConversation
  ) : Promise<{status : string}> {
    try{
      var conversationBody : newConversation
      if(props.type === ConversationType.PRIVATE){
        conversationBody = {
          type : ConversationType.PRIVATE,
          participantCount : 2
        }
      }else {
        conversationBody = {
          type : ConversationType.GROUP,
          participantCount : props.userIds.length,
          name : props.name,
          description : props.description,
          groupImage : props.groupImage
        }
      }

      const conversation = await this.createConversation(
        conversationBody
      )

      if(conversation){
        console.log("conversatoin createed", conversation)
        await Promise.all(
          props.userIds.map(async (userId)=> {
            try{
              await this.createParticipant({
                conversationId : conversation.id,
                userId : userId
              })
            }catch(error){
              console.log("participant creation failed", error)
            }
          })
        )

        return {status : "conversation populated successfully"}

      }
    }catch(error){
      console.log("conversation population failed", error)
    }   
  }

  async addUsertoAConversation(
    props : newParticipant
  ) : Promise<{status : string}> {
    try{
      const valdation = await this.validateConversationType(props.conversationId);
      if(valdation.isGroup){
        const participant = await this.createParticipant({
          conversationId : props.conversationId,
          userId : props.userId,
          role : ParticipantRole.MEMBER,
          nickname : props.nickname
        })
  
        if(participant){
          return {status : "participant added successfully"}
        }
      }
    }catch(error){
      console.log("error adding participant", error)
    }
  }


  async getConversationById(
    conversationId : string
  ) : Promise<Conversation> {
    try{
      const conversation = await this.prisma.conversation.findUnique(
        {
          where : {
            id : conversationId
          },
        }
      )
      return conversation
    }catch(error){
      console.log("conversation fetch failed", error)
    }
  }

  async getConversationByIdWithPartipants(
    conversationId : string
  ) : Promise<Conversation> {
    try{
      const conversation = await this.prisma.conversation.findUnique(
        {
          where : {
            id : conversationId
          },
          include : {
            participants : true
          }
        }
      )

      return conversation
    }catch(error){
      console.log("conversation fetch failed", error)
      throw error
    }
  }


  async getUserConversations(
    userId: string
  ): Promise<Conversation[]> {
    try {
      const conversations = await this.prisma.conversation.findMany({
        // include: {
        //   participants: true,
        //   messages : true
        // },
        where: {
          participants: {
            some: {
              userId: userId,
              isActive: true  
            }
          }
        },
        orderBy: {
          updatedAt: 'desc' 
        }
      });
      return conversations;
    } catch (error) {
      console.log("error fetching user conversations", error);
      throw error;  
    }
  }


  async deleteConversation(
    conversationId : string
  ) : Promise<{status : string}> {
    try{
      const deleteAllMsgsInConv = await this.messageService.deleteMessagesByConversationId(
          conversationId
      )

      if(!deleteAllMsgsInConv) throw new Error("failed to delete messages in conversation")
      const deleteConversation = await this.prisma.conversation.delete(
        {
          where : {
            id : conversationId
          }
        }
      )

      if(deleteConversation) return {status : "conversation deleted successfully"}
    }catch(error){
      console.log("conversation deletion failed", error)
      throw error
    }
  }

  async updateLastMessage(
    conversationId : string,
    messageId : string,
    messagecontent : string,
    messageType : MessageType,
    messageSender : string,
    messageTimeStamp : string,
  ) : Promise<{status : string}> {
    try{
      const updateConversation = await this.prisma.conversation.update({
        where : {
          id : conversationId
        },
        data : {
          lastMessageId : messageId,
          lastMessageText : messagecontent,
          lastMessageType : messageType,
          lastMessageSender : messageSender,
          lastMessageTimestamp: messageTimeStamp
        }
      })

      if(updateConversation) return {status : "last message updated successfully"}
    }catch(error){
      console.log("last message update failed", error)
      throw error
    }
  }


  async validateConversation(
    conversationId : string,
    userId : string
  ) : Promise<boolean> {
    const conversation = await this.prisma.conversation.findUnique(
      {
        where : {
          id : conversationId,
          participants : {
             some : {
               userId : userId,
               isActive : true
             }
          }
        }
      }
    )

    if(conversation) return true
    else return false
  }
  async validateConversationType(
    conversationId : string
  ) : Promise<{isGroup : boolean}> {
    if(conversationId){
      try{
        const conversation = await this.prisma.conversation.findUnique(
          {
            where : {
              id : conversationId
            }
          }
        )
        if(conversation.type === ConversationType.GROUP){
          return {isGroup : true}
        }
        return {isGroup : false}
      }catch(error){
        console.log("conversation validation failed", error)
      }
    }
  }
}
