'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import AddNewChat from '../ui/newChat'
import NewChatModal from '../ui/newUser'
import { useUserStore } from '@/store/userStore'

interface User {
  id: string
  name: string
  username: string
  email: string
  mobile: string
  profilePicture?: string
  gender: 'MALE' | 'FEMALE'
  isOnline: boolean
  lastSeen: string
  status: 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'
}

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

interface ConversationParticipant {
  id: string
  conversationId: string
  userId: string
  role: 'MEMBER' | 'ADMIN' | 'OWNER'
  joinedAt: string
  leftAt?: string
  isActive: boolean
  isMuted: boolean
  nickname?: string
  lastReadMessageId?: string
  lastReadAt?: string
}

interface ChatSidebarProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  onConversationSelect: (conversationId: string) => void
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ conversations, selectedConversationId, onConversationSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const filteredConversations = conversations.filter((conversation) => (conversation.name || '').toLowerCase().includes(searchTerm.toLowerCase()))

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL

  const { user } = useUserStore()

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffMs = now.getTime() - messageDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'GROUP') {
      return conversation.groupImage || '👥'
    }
    return '👤'
  }

  const getUnreadCount = (conversation: Conversation) => {
    return Math.floor(Math.random() * 3)
  }

  const handleCreateChat = async (userId: string) => {
    setIsCreating(true)
    try {
      var body = {
        userIds: [userId, user?.id],
        type: 'PRIVATE',
      }
      const createNewChat = await fetch(`${backend}/conversation/createConversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!createNewChat.ok) throw new Error('Failed to create chat')
      setIsModalOpen(false)
    } catch (error) {
      console.error('Failed to create chat:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Messages</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-800 placeholder-gray-500 dark:bg-neutral-700 dark:text-white dark:placeholder-gray-400 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {' '}
        {/* Add padding bottom for floating button space */}
        {filteredConversations.map((conversation) => {
          const isSelected = selectedConversationId === conversation.id
          const unreadCount = getUnreadCount(conversation)

          return (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className={`p-4 border-b cursor-pointer transition-colors duration-200
                ${isSelected ? 'bg-blue-50 dark:bg-[#4267B2] border-r-2' : 'hover:bg-gray-50 dark:hover:bg-neutral-900'}
                border-gray-100 dark:border-neutral-700
                text-gray-900 dark:text-white`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-neutral-900 flex items-center justify-center text-xl">{getConversationAvatar(conversation)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{conversation.name || `Conversation ${conversation.id.slice(-4)}`}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatTime(conversation.lastMessageTimestamp)}</span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{conversation.lastMessageText || 'No messages yet'}</p>
                    {unreadCount > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">{unreadCount}</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-4 right-4 z-20">
        <AddNewChat addNew={() => setIsModalOpen(true)} />
        <NewChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateChat={handleCreateChat} isLoading={isCreating} />
      </div>
    </div>
  )
}

export default ChatSidebar
