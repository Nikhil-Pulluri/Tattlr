'use client'
import React, { useState } from 'react'
import { Send, MoreVertical } from 'lucide-react'

// interface User {
//   id: string
//   name: string
//   username: string
//   email: string
//   mobile: string
//   profilePicture?: string
//   gender: 'MALE' | 'FEMALE'
//   isOnline: boolean
//   lastSeen: string
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
  lastMessageTimestamp?: string // Changed from Date to string
  lastMessageType?: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
  createdAt: string // Changed from Date to string
  updatedAt: string // Changed from Date to string
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
  createdAt: string // Changed from Date to string
  updatedAt: string // Changed from Date to string
}

// interface ConversationParticipant {
//   id: string
//   conversationId: string
//   userId: string
//   role: 'MEMBER' | 'ADMIN' | 'OWNER'
//   joinedAt: string // Changed from Date to string
//   leftAt?: string // Changed from Date to string
//   isActive: boolean
//   isMuted: boolean
//   nickname?: string
//   lastReadMessageId?: string
//   lastReadAt?: string // Changed from Date to string
// }

interface ChatWindowProps {
  conversation: Conversation | null
  messages: Message[]
  onSendMessage: (message: string) => void
  currentUserId: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, messages, onSendMessage, currentUserId }) => {
  const [message, setMessage] = useState('')

  const handleSendMessage = (): void => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'GROUP') {
      return conversation.groupImage || '👥'
    }
    return '👤'
  }

  const getConversationStatus = (conversation: Conversation) => {
    if (conversation.type === 'GROUP') {
      return `${conversation.participantCount} members`
    }
    // For private conversations, you would check the other participant's online status
    return 'Online' // Dummy status
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-neutral-800">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Select a conversation</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-neutral-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-900 flex items-center justify-center text-lg">{getConversationAvatar(conversation)}</div>

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{conversation.name || `Conversation ${conversation.id.slice(-4)}`}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{getConversationStatus(conversation)}</p>
          </div>
        </div>

        <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full">
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4  overflow-hidden break-words whitespace-pre-wrap py-2 rounded-lg ${
                msg.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{msg.content?.text}</p>
              <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
