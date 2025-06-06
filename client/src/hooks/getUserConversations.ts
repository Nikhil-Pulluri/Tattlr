import { useQuery } from "@tanstack/react-query"

interface Conversation {
  id: string
  type: 'PRIVATE' | 'GROUP'
  name?: string
  description?: string
  groupImage?: string
  participantCount: number
  messageCount: number
  isArchived: boolean
  lastMessageText?: string
  lastMessageSender?: string
  lastMessageTimestamp?: string
  lastMessageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
  createdAt: string
  updatedAt: string
}


async function fetchConversations(userId: string): Promise<Conversation[]> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL
  const conversations = await fetch(`${backend}/conversation/getUserConversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: userId }),
  })

  if (!conversations.ok) console.log('error fetching conversations', conversations.json())

  // console.log('conversations:', conversations.json())

  const data = await conversations.json()
  // console.log('conversations', data)
  return data
}

export function useUserConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['conversations', userId],
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
  })
}
