'use client'
import React, { useState, useEffect } from 'react'
import ChatSidebar from './chatSidebar'
import ChatWindow from './chatWindow'
import { useUserStore } from '@/store/userStore'
import { useQuery } from '@tanstack/react-query'

// interface User {
//   id: string
//   name: string
//   username: string
//   email: string
//   mobile: string
//   profilePicture?: string
//   gender: 'MALE' | 'FEMALE'
//   isOnline: boolean
//   lastSeen: Date
//   status: 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'
// }

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
  lastMessageTimestamp?: Date
  lastMessageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
  createdAt: Date
  updatedAt: Date
}

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
  createdAt: Date
  updatedAt: Date
}

// interface ConversationParticipant {
//   id: string
//   conversationId: string
//   userId: string
//   role: 'MEMBER' | 'ADMIN' | 'OWNER'
//   joinedAt: Date
//   leftAt?: Date
//   isActive: boolean
//   isMuted: boolean
//   nickname?: string
//   lastReadMessageId?: string
//   lastReadAt?: Date
// }

async function fetchConversations(userId: string): Promise<Conversation[]> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL
  const conversations = await fetch(`${backend}/conversation/getUserConversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: userId }),
  })

  return conversations.json()
}

async function fetchMessages(conversationId: string): Promise<Message[]> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL
  const messages = await fetch(`${backend}/message/getMessagesByConversationId`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversationId: conversationId }),
  })

  return messages.json()
}

const ChatLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isClient, setIsClient] = useState(false)
  const { user, userStatus } = useUserStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    console.log(userStatus, 'from chat')
    console.log(user, 'from chat')
  }, [userStatus])

  // Dummy conversations data aligned with Prisma schema
  const conversations: Conversation[] = [
    {
      id: '675a1b2c3d4e5f6789012345',
      type: 'PRIVATE',
      name: 'Alice Johnson',
      participantCount: 2,
      messageCount: 15,
      isArchived: false,
      lastMessageText: 'Hey! How are you doing today?',
      lastMessageSender: '675a1b2c3d4e5f6789012346',
      lastMessageTimestamp: new Date('2024-06-05T14:30:00Z'),
      lastMessageType: 'TEXT',
      createdAt: new Date('2024-06-01T10:00:00Z'),
      updatedAt: new Date('2024-06-05T14:30:00Z'),
    },
    {
      id: '675a1b2c3d4e5f6789012347',
      type: 'GROUP',
      name: 'Development Team',
      description: 'Development team discussions',
      participantCount: 5,
      messageCount: 42,
      isArchived: false,
      lastMessageText: 'The new feature is ready for testing',
      lastMessageSender: '675a1b2c3d4e5f6789012348',
      lastMessageTimestamp: new Date('2024-06-05T13:15:00Z'),
      lastMessageType: 'TEXT',
      createdAt: new Date('2024-05-20T09:00:00Z'),
      updatedAt: new Date('2024-06-05T13:15:00Z'),
    },
    {
      id: '675a1b2c3d4e5f6789012349',
      type: 'PRIVATE',
      name: 'Sarah Miller',
      participantCount: 2,
      messageCount: 8,
      isArchived: false,
      lastMessageText: 'Thanks for the help with the project!',
      lastMessageSender: '675a1b2c3d4e5f678901234a',
      lastMessageTimestamp: new Date('2024-06-05T12:45:00Z'),
      lastMessageType: 'TEXT',
      createdAt: new Date('2024-06-03T11:00:00Z'),
      updatedAt: new Date('2024-06-05T12:45:00Z'),
    },
    {
      id: '675a1b2c3d4e5f678901234b',
      type: 'GROUP',
      name: 'Marketing Group',
      description: 'Marketing team coordination',
      participantCount: 4,
      messageCount: 23,
      isArchived: false,
      lastMessageText: 'Campaign results look promising',
      lastMessageSender: '675a1b2c3d4e5f678901234c',
      lastMessageTimestamp: new Date('2024-06-05T11:30:00Z'),
      lastMessageType: 'TEXT',
      createdAt: new Date('2024-05-15T14:00:00Z'),
      updatedAt: new Date('2024-06-05T11:30:00Z'),
    },
    {
      id: '675a1b2c3d4e5f678901234d',
      type: 'PRIVATE',
      name: 'Mike Chen',
      participantCount: 2,
      messageCount: 12,
      isArchived: false,
      lastMessageText: "Let's schedule that meeting",
      lastMessageSender: '675a1b2c3d4e5f678901234e',
      lastMessageTimestamp: new Date('2024-06-04T16:00:00Z'),
      lastMessageType: 'TEXT',
      createdAt: new Date('2024-06-02T08:30:00Z'),
      updatedAt: new Date('2024-06-04T16:00:00Z'),
    },
  ]

  // Dummy messages data aligned with Prisma schema
  const messagesByConversation: { [key: string]: Message[] } = {
    '675a1b2c3d4e5f6789012345': [
      {
        id: '675a1b2c3d4e5f6789012350',
        conversationId: '675a1b2c3d4e5f6789012345',
        senderId: '675a1b2c3d4e5f6789012346',
        messageType: 'TEXT',
        status: 'READ',
        isDeleted: false,
        isEdited: false,
        content: { text: 'Hey! How are you doing today?' },
        createdAt: new Date('2024-06-05T14:28:00Z'),
        updatedAt: new Date('2024-06-05T14:28:00Z'),
      },
      {
        id: '675a1b2c3d4e5f6789012351',
        conversationId: '675a1b2c3d4e5f6789012345',
        senderId: user?.id || 'current-user-id',
        messageType: 'TEXT',
        status: 'READ',
        isDeleted: false,
        isEdited: false,
        content: { text: "I'm doing great, thanks for asking! How about you?" },
        createdAt: new Date('2024-06-05T14:29:00Z'),
        updatedAt: new Date('2024-06-05T14:29:00Z'),
      },
      {
        id: '675a1b2c3d4e5f6789012352',
        conversationId: '675a1b2c3d4e5f6789012345',
        senderId: '675a1b2c3d4e5f6789012346',
        messageType: 'TEXT',
        status: 'READ',
        isDeleted: false,
        isEdited: false,
        content: { text: 'Pretty good! Just working on some new projects' },
        createdAt: new Date('2024-06-05T14:30:00Z'),
        updatedAt: new Date('2024-06-05T14:30:00Z'),
      },
    ],
    '675a1b2c3d4e5f6789012347': [
      {
        id: '675a1b2c3d4e5f6789012353',
        conversationId: '675a1b2c3d4e5f6789012347',
        senderId: '675a1b2c3d4e5f6789012348',
        messageType: 'TEXT',
        status: 'READ',
        isDeleted: false,
        isEdited: false,
        content: { text: 'The new feature is ready for testing' },
        createdAt: new Date('2024-06-05T13:14:00Z'),
        updatedAt: new Date('2024-06-05T13:14:00Z'),
      },
      {
        id: '675a1b2c3d4e5f6789012354',
        conversationId: '675a1b2c3d4e5f6789012347',
        senderId: user?.id || 'current-user-id',
        messageType: 'TEXT',
        status: 'READ',
        isDeleted: false,
        isEdited: false,
        content: { text: "Great! I'll check it out now" },
        createdAt: new Date('2024-06-05T13:15:00Z'),
        updatedAt: new Date('2024-06-05T13:15:00Z'),
      },
    ],
  }

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) || null

  useEffect(() => {
    if (selectedConversationId) {
      setMessages(messagesByConversation[selectedConversationId] || [])
    }
  }, [selectedConversationId])

  const handleConversationSelect = (conversationId: string): void => {
    setSelectedConversationId(conversationId)
  }

  const handleSendMessage = (messageText: string): void => {
    if (selectedConversationId && user) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId: selectedConversationId,
        senderId: user.id,
        messageType: 'TEXT',
        status: 'SENT',
        isDeleted: false,
        isEdited: false,
        content: { text: messageText },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setMessages((prev) => [...prev, newMessage])
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen bg-white dark:bg-neutral-800">
        {/* Loading sidebar - responsive widths */}
        <div className="w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700">
          <div className="p-4">Loading...</div>
        </div>
        {/* Loading message area - hidden on mobile, flex-1 on larger screens */}
        <div className="hidden sm:flex flex-1 items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-800">
      <ChatSidebar conversations={conversations} selectedConversationId={selectedConversationId} onConversationSelect={handleConversationSelect} />
      <ChatWindow conversation={selectedConversation} messages={messages} onSendMessage={handleSendMessage} currentUserId={user?.id || 'current-user-id'} />
      {children}
    </div>
  )
}

export default ChatLayout

// 'use client'
// import React, { useState, useEffect } from 'react'
// import ChatSidebar from './chatSidebar'
// import ChatWindow from './chatWindow'
// import { Chat, Message } from '@/types/chat'
// // import { useUser } from '@/context/userContext'
// import { useUserStore } from '@/store/userStore'
// // import { useUser } from '@/context/userContext'

// const ChatLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
//   const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   // const { user, userStatus } = useUser()
//   const { user, userStatus } = useUserStore()

//   useEffect(() => {
//     console.log(userStatus, 'from chat')
//     console.log(user, 'from chat')
//   }, [userStatus])

//   const chats: Chat[] = [
//     {
//       id: 1,
//       name: 'Alice Johnson',
//       lastMessage: 'Hey! How are you doing today?',
//       time: '2:30 PM',
//       unread: 2,
//       avatar: '👩‍💼',
//     },
//     {
//       id: 2,
//       name: 'Development Team',
//       lastMessage: 'The new feature is ready for testing',
//       time: '1:15 PM',
//       unread: 0,
//       avatar: '👥',
//     },
//     {
//       id: 3,
//       name: 'Sarah Miller',
//       lastMessage: 'Thanks for the help with the project!',
//       time: '12:45 PM',
//       unread: 1,
//       avatar: '👩‍🎨',
//     },
//     {
//       id: 4,
//       name: 'Marketing Group',
//       lastMessage: 'Campaign results look promising',
//       time: '11:30 AM',
//       unread: 0,
//       avatar: '📈',
//     },
//     {
//       id: 5,
//       name: 'Mike Chen',
//       lastMessage: "Let's schedule that meeting",
//       time: 'Yesterday',
//       unread: 0,
//       avatar: '👨‍💻',
//     },
//   ]

//   const messagesByChat: { [key: number]: Message[] } = {
//     1: [
//       { id: 1, text: 'Hey! How are you doing today?', sender: 'other', time: '2:28 PM' },
//       { id: 2, text: "I'm doing great, thanks for asking! How about you?", sender: 'me', time: '2:29 PM' },
//       { id: 3, text: 'Pretty good! Just working on some new projects', sender: 'other', time: '2:30 PM' },
//     ],
//     2: [
//       { id: 1, text: 'The new feature is ready for testing', sender: 'other', time: '1:14 PM' },
//       { id: 2, text: "Great! I'll check it out now", sender: 'me', time: '1:15 PM' },
//     ],
//     3: [
//       { id: 1, text: 'Thanks for the help with the project!', sender: 'other', time: '12:45 PM' },
//       { id: 2, text: "You're welcome! Happy to help anytime", sender: 'me', time: '12:46 PM' },
//     ],
//     4: [
//       { id: 1, text: 'Campaign results look promising', sender: 'other', time: '11:29 AM' },
//       { id: 2, text: "That's excellent news!", sender: 'me', time: '11:30 AM' },
//     ],
//     5: [
//       { id: 1, text: "Let's schedule that meeting", sender: 'other', time: 'Yesterday' },
//       { id: 2, text: 'Sure, when works best for you?', sender: 'me', time: 'Yesterday' },
//     ],
//   }

//   const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null

//   useEffect(() => {
//     if (selectedChatId) {
//       setMessages(messagesByChat[selectedChatId] || [])
//     }
//   }, [selectedChatId])

//   const handleChatSelect = (chatId: number): void => {
//     setSelectedChatId(chatId)
//   }

//   const handleSendMessage = (messageText: string): void => {
//     if (selectedChatId) {
//       const newMessage: Message = {
//         id: messages.length + 1,
//         text: messageText,
//         sender: 'me',
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       }
//       setMessages((prev) => [...prev, newMessage])
//     }
//   }

//   return (
//     <div className="flex h-screen w-full bg-gray-50">
//       <ChatSidebar chats={chats} selectedChatId={selectedChatId} onChatSelect={handleChatSelect} />
//       <ChatWindow chat={selectedChat} messages={messages} onSendMessage={handleSendMessage} />
//       {children}
//     </div>
//   )
// }

// export default ChatLayout
