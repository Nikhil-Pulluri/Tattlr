'use client'
import React, { useState, useEffect } from 'react'
import ChatSidebar from './chatSidebar'
import ChatWindow from './chatWindow'
import { useUserStore } from '@/store/userStore'
import { useUserMessagesMap } from '@/hooks/getUserMessagesMap'
import { useUserConversations } from '@/hooks/getUserConversations'

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

const ChatLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isClient, setIsClient] = useState(false)
  const { user, userStatus } = useUserStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: conversations = [], isLoading, isError, error } = useUserConversations(user?.id)

  const conversationIds = conversations.map((conv) => conv.id)

  const { data: messagesMap = {}, isLoading: messagesLoading } = useUserMessagesMap(conversationIds)

  // console.log('chatLayout messages', messagesMap)

  const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) || null

  useEffect(() => {
    if (selectedConversationId) {
      setMessages(messagesMap[selectedConversationId] || [])
    }
  }, [selectedConversationId, messagesMap])

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, newMessage])
    }
  }

  if (!isClient) {
    return (
      <div className="flex h-screen bg-white dark:bg-neutral-800">
        <div className="w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700">
          <div className="p-4">Loading...</div>
        </div>

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

// dummy for testing
// const conversations: Conversation[] = [
//   {
//     id: '675a1b2c3d4e5f6789012345',
//     type: 'PRIVATE',
//     name: 'Alice Johnson',
//     participantCount: 2,
//     messageCount: 15,
//     isArchived: false,
//     lastMessageText: 'Hey! How are you doing today?',
//     lastMessageSender: '675a1b2c3d4e5f6789012346',
//     lastMessageTimestamp: '2024-06-05T14:30:00Z',
//     lastMessageType: 'TEXT',
//     createdAt: '2024-06-01T10:00:00Z',
//     updatedAt: '2024-06-05T14:30:00Z',
//   },
//   {
//     id: '675a1b2c3d4e5f6789012347',
//     type: 'GROUP',
//     name: 'Development Team',
//     description: 'Development team discussions',
//     participantCount: 5,
//     messageCount: 42,
//     isArchived: false,
//     lastMessageText: 'The new feature is ready for testing',
//     lastMessageSender: '675a1b2c3d4e5f6789012348',
//     lastMessageTimestamp: '2024-06-05T13:15:00Z',
//     lastMessageType: 'TEXT',
//     createdAt: '2024-05-20T09:00:00Z',
//     updatedAt: '2024-06-05T13:15:00Z',
//   },
//   {
//     id: '675a1b2c3d4e5f6789012349',
//     type: 'PRIVATE',
//     name: 'Sarah Miller',
//     participantCount: 2,
//     messageCount: 8,
//     isArchived: false,
//     lastMessageText: 'Thanks for the help with the project!',
//     lastMessageSender: '675a1b2c3d4e5f678901234a',
//     lastMessageTimestamp: '2024-06-05T12:45:00Z',
//     lastMessageType: 'TEXT',
//     createdAt: '2024-06-03T11:00:00Z',
//     updatedAt: '2024-06-05T12:45:00Z',
//   },
//   {
//     id: '675a1b2c3d4e5f678901234b',
//     type: 'GROUP',
//     name: 'Marketing Group',
//     description: 'Marketing team coordination',
//     participantCount: 4,
//     messageCount: 23,
//     isArchived: false,
//     lastMessageText: 'Campaign results look promising',
//     lastMessageSender: '675a1b2c3d4e5f678901234c',
//     lastMessageTimestamp: '2024-06-05T11:30:00Z',
//     lastMessageType: 'TEXT',
//     createdAt: '2024-05-15T14:00:00Z',
//     updatedAt: '2024-06-05T11:30:00Z',
//   },
//   {
//     id: '675a1b2c3d4e5f678901234d',
//     type: 'PRIVATE',
//     name: 'Mike Chen',
//     participantCount: 2,
//     messageCount: 12,
//     isArchived: false,
//     lastMessageText: "Let's schedule that meeting",
//     lastMessageSender: '675a1b2c3d4e5f678901234e',
//     lastMessageTimestamp: '2024-06-04T16:00:00Z',
//     lastMessageType: 'TEXT',
//     createdAt: '2024-06-02T08:30:00Z',
//     updatedAt: '2024-06-04T16:00:00Z',
//   },
// ]

// const messagesByConversation: { [key: string]: Message[] } = {
//   '675a1b2c3d4e5f6789012345': [
//     {
//       id: '675a1b2c3d4e5f6789012350',
//       conversationId: '675a1b2c3d4e5f6789012345',
//       senderId: '675a1b2c3d4e5f6789012346',
//       messageType: 'TEXT',
//       status: 'READ',
//       isDeleted: false,
//       isEdited: false,
//       content: { text: 'Hey! How are you doing today?' },
//       createdAt: '2024-06-05T14:28:00Z',
//       updatedAt: '2024-06-05T14:28:00Z',
//     },
//     {
//       id: '675a1b2c3d4e5f6789012351',
//       conversationId: '675a1b2c3d4e5f6789012345',
//       senderId: user?.id || 'current-user-id',
//       messageType: 'TEXT',
//       status: 'READ',
//       isDeleted: false,
//       isEdited: false,
//       content: { text: "I'm doing great, thanks for asking! How about you?" },
//       createdAt: '2024-06-05T14:29:00Z',
//       updatedAt: '2024-06-05T14:29:00Z',
//     },
//     {
//       id: '675a1b2c3d4e5f6789012352',
//       conversationId: '675a1b2c3d4e5f6789012345',
//       senderId: '675a1b2c3d4e5f6789012346',
//       messageType: 'TEXT',
//       status: 'READ',
//       isDeleted: false,
//       isEdited: false,
//       content: { text: 'Pretty good! Just working on some new projects' },
//       createdAt: '2024-06-05T14:30:00Z',
//       updatedAt: '2024-06-05T14:30:00Z',
//     },
//   ],
//   '675a1b2c3d4e5f6789012347': [
//     {
//       id: '675a1b2c3d4e5f6789012353',
//       conversationId: '675a1b2c3d4e5f6789012347',
//       senderId: '675a1b2c3d4e5f6789012348',
//       messageType: 'TEXT',
//       status: 'READ',
//       isDeleted: false,
//       isEdited: false,
//       content: { text: 'The new feature is ready for testing' },
//       createdAt: '2024-06-05T13:14:00Z',
//       updatedAt: '2024-06-05T13:14:00Z',
//     },
//     {
//       id: '675a1b2c3d4e5f6789012354',
//       conversationId: '675a1b2c3d4e5f6789012347',
//       senderId: user?.id || 'current-user-id',
//       messageType: 'TEXT',
//       status: 'READ',
//       isDeleted: false,
//       isEdited: false,
//       content: { text: "Great! I'll check it out now" },
//       createdAt: '2024-06-05T13:15:00Z',
//       updatedAt: '2024-06-05T13:15:00Z',
//     },
//   ],
// }
