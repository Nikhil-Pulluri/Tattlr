'use client'

import React, { useState, useEffect } from 'react'
import ChatSidebar from './chatSidebar'
import ChatWindow from './chatWindow'
import { Chat, Message } from '@/types/chat'

const ChatLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])

  const chats: Chat[] = [
    {
      id: 1,
      name: 'Alice Johnson',
      lastMessage: 'Hey! How are you doing today?',
      time: '2:30 PM',
      unread: 2,
      avatar: '👩‍💼',
    },
    {
      id: 2,
      name: 'Development Team',
      lastMessage: 'The new feature is ready for testing',
      time: '1:15 PM',
      unread: 0,
      avatar: '👥',
    },
    {
      id: 3,
      name: 'Sarah Miller',
      lastMessage: 'Thanks for the help with the project!',
      time: '12:45 PM',
      unread: 1,
      avatar: '👩‍🎨',
    },
    {
      id: 4,
      name: 'Marketing Group',
      lastMessage: 'Campaign results look promising',
      time: '11:30 AM',
      unread: 0,
      avatar: '📈',
    },
    {
      id: 5,
      name: 'Mike Chen',
      lastMessage: "Let's schedule that meeting",
      time: 'Yesterday',
      unread: 0,
      avatar: '👨‍💻',
    },
  ]

  const messagesByChat: { [key: number]: Message[] } = {
    1: [
      { id: 1, text: 'Hey! How are you doing today?', sender: 'other', time: '2:28 PM' },
      { id: 2, text: "I'm doing great, thanks for asking! How about you?", sender: 'me', time: '2:29 PM' },
      { id: 3, text: 'Pretty good! Just working on some new projects', sender: 'other', time: '2:30 PM' },
    ],
    2: [
      { id: 1, text: 'The new feature is ready for testing', sender: 'other', time: '1:14 PM' },
      { id: 2, text: "Great! I'll check it out now", sender: 'me', time: '1:15 PM' },
    ],
    3: [
      { id: 1, text: 'Thanks for the help with the project!', sender: 'other', time: '12:45 PM' },
      { id: 2, text: "You're welcome! Happy to help anytime", sender: 'me', time: '12:46 PM' },
    ],
    4: [
      { id: 1, text: 'Campaign results look promising', sender: 'other', time: '11:29 AM' },
      { id: 2, text: "That's excellent news!", sender: 'me', time: '11:30 AM' },
    ],
    5: [
      { id: 1, text: "Let's schedule that meeting", sender: 'other', time: 'Yesterday' },
      { id: 2, text: 'Sure, when works best for you?', sender: 'me', time: 'Yesterday' },
    ],
  }

  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null

  useEffect(() => {
    if (selectedChatId) {
      setMessages(messagesByChat[selectedChatId] || [])
    }
  }, [selectedChatId])

  const handleChatSelect = (chatId: number): void => {
    setSelectedChatId(chatId)
  }

  const handleSendMessage = (messageText: string): void => {
    if (selectedChatId) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: messageText,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, newMessage])
    }
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      <ChatSidebar chats={chats} selectedChatId={selectedChatId} onChatSelect={handleChatSelect} />
      <ChatWindow chat={selectedChat} messages={messages} onSendMessage={handleSendMessage} />
      {children}
    </div>
  )
}

export default ChatLayout
