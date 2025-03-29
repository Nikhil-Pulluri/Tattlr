'use client'
import React, { useState, useEffect } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatArea from './ChatArea'
import { useChat } from '@/context/chatContext'

interface Chat {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  online: boolean
}

export default function ChatSection() {
  const [message, setMessage] = useState('')
  const { selectedChatId, setSelectedChatId } = useChat()

  // Dummy chat data with consistent user IDs
  const chats: Chat[] = [
    {
      id: 'cm7ypx40i0000i1uwax7pk14o', // Using the same ID as your JWT token's sub field
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      time: '2:30 PM',
      unread: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      online: true,
    },
    {
      id: 'cm7lrgseh0000i1i41im8y3d3', // Different user ID
      name: 'Jane Smith',
      lastMessage: 'See you tomorrow!',
      time: '1:45 PM',
      unread: 0,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      online: false,
    },
    {
      id: 'cm8rnacii0003i1o0jdtxurl3', // Different user ID
      name: 'Mike Johnson',
      lastMessage: 'Great idea!',
      time: '12:15 PM',
      unread: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      online: true,
    },
  ]

  // Log when selected chat changes
  useEffect(() => {
    console.log('Selected chat changed:', selectedChatId)
    if (selectedChatId) {
      const selectedChat = chats.find((chat) => chat.id === selectedChatId)
      console.log('Selected chat details:', selectedChat)
    }
  }, [selectedChatId])

  const handleSend = () => {
    if (message.trim() && selectedChatId) {
      // TODO: Implement message sending logic
      setMessage('')
    }
  }

  return (
    <div className="flex h-full">
      <ChatSidebar selectedChat={selectedChatId} searchQuery="" onSearchChange={() => {}} onChatSelect={setSelectedChatId} chats={chats} />
      <ChatArea selectedChat={selectedChatId} message={message} onMessageChange={setMessage} onSend={handleSend} />
    </div>
  )
}
