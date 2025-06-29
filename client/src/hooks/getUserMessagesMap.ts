import { useQuery } from '@tanstack/react-query'

interface Message {
  id: string
  conversationId: string
  senderId: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
  status: 'SENT' | 'DELIVERED' | 'READ'
  isDeleted: boolean
  isEdited: boolean
  content?: { 
    text?: string
    mediaUrl?: string
    fileName?: string
    fileSize?: number
    mimeType?: string
    location?: {
      latitude: number
      longitude: number
      address?: string
    }
    systemAction?: 'USER_JOINED' | 'USER_LEFT' | 'USER_ADDED' | 'USER_REMOVED' | 'GROUP_CREATED' | 'GROUP_RENAMED'
  }
  replyToId?: string
  createdAt: string 
  updatedAt: string 
}

const backend = process.env.NEXT_PUBLIC_BACKEND_URL!

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL
  const messages = await fetch(`${backend}/message/getMessagesByConversationId`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversationId: conversationId }),
  })

  return messages.json()
}

async function fetchMessagesMap(conversationIds : string[] | undefined){
  // console.log("message map called")

  const messageMap : { [conversationId: string]: Message[] } = {}


  for(const conversationId of conversationIds?.filter(Boolean) ?? []){
    const messages = await fetchMessages(conversationId)
    messageMap[conversationId] = messages
  }

  return messageMap
}

export function useUserMessagesMap(conversationIds: string[] | undefined) {
  return useQuery({
    queryKey: ['messagesMap', conversationIds],
    queryFn: () => fetchMessagesMap(conversationIds!),
    enabled: !!conversationIds,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 ,
  })
}
