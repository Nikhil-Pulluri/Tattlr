'use client'

import React, { useState } from 'react'
import { Send, MoreVertical } from 'lucide-react'
import { Chat, Message } from '@/types/chat'

interface ChatWindowProps {
  chat: Chat | null
  messages: Message[]
  onSendMessage: (message: string) => void
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, messages, onSendMessage }) => {
  const [message, setMessage] = useState<string>('')

  const handleSendMessage = (): void => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-neutral-800">
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-600 dark:text-white mb-2">Select a conversation</h2>
          <p className="text-gray-500 dark:text-gray-400">Choose a chat from the sidebar to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-neutral-800">
      {/* Chat Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{chat.avatar}</div>
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">{chat.name}</h2>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-neutral-800">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] lg:max-w-md px-4 py-2 rounded-lg overflow-hidden break-words whitespace-pre-wrap ${
                msg.sender === 'me' ? 'bg-[#4267B2] text-white' : 'bg-white dark:bg-neutral-900 text-gray-800 dark:text-white border border-gray-200 dark:border-neutral-700'
              }`}
            >
              <p className="text-sm text-justify">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
