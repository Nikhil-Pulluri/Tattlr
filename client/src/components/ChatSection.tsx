'use client'
import React, { useState } from 'react'
import ChatSidebar from './chat/ChatSidebar'
import ChatHeader from './chat/ChatHeader'
import MessageList from './chat/MessageList'
import MessageInput from './chat/MessageInput'
import EmptyChat from './chat/EmptyChat'

interface Chat {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  online: boolean
}

interface Message {
  id: string
  text: string
  time: string
  isSent: boolean
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

export default function ChatSection() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')

  // Dummy data for chats
  const chats: Chat[] = [
    {
      id: 'cm7lrgseh0000i1i41im8y3d3',
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      time: '10:30 AM',
      unread: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      online: true,
    },
    {
      id: 'cm7ypx40i0000i1uwax7pk14o',
      name: 'Jane Smith',
      lastMessage: 'See you tomorrow!',
      time: '9:45 AM',
      unread: 0,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      online: false,
    },
    {
      id: '3',
      name: 'Mike Johnson',
      lastMessage: 'The project is ready',
      time: 'Yesterday',
      unread: 1,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      online: true,
    },
  ]

  // Dummy data for messages
  const messages: Message[] = [
    {
      id: '1',
      text: 'Hey! How are you?',
      time: '10:30 AM',
      isSent: true,
    },
    {
      id: '2',
      text: "I'm good, thanks! How about you?",
      time: '10:31 AM',
      isSent: false,
    },
  ]

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', messageInput)
      setMessageInput('')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      <ChatSidebar selectedChat={selectedChat} searchQuery={searchQuery} onSearchChange={setSearchQuery} onChatSelect={setSelectedChat} chats={chats} />

      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader
              name={chats.find((chat) => chat.id === selectedChat)?.name || ''}
              avatar={chats.find((chat) => chat.id === selectedChat)?.avatar || DEFAULT_AVATAR}
              online={chats.find((chat) => chat.id === selectedChat)?.online || false}
            />
            <MessageList messages={messages} />
            <MessageInput message={messageInput} onMessageChange={setMessageInput} onSend={handleSendMessage} />
          </>
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  )
}
