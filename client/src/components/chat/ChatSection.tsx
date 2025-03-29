'use client'
import React, { useState } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatArea from './ChatArea'
import { useChat } from '@/context/chatContext'

export default function ChatSection() {
  const [message, setMessage] = useState('')
  const { selectedChatId, setSelectedChatId } = useChat()

  const handleSend = () => {
    if (message.trim() && selectedChatId) {
      // TODO: Implement message sending logic
      setMessage('')
    }
  }

  return (
    <div className="flex h-full">
      <ChatSidebar selectedChat={selectedChatId} onChatSelect={setSelectedChatId} />
      <ChatArea selectedChat={selectedChatId} message={message} onMessageChange={setMessage} onSend={handleSend} />
    </div>
  )
}
