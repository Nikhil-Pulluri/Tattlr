'use client'

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { Chat } from '@/types/chat'

interface ChatSidebarProps {
  chats: Chat[]
  selectedChatId: number | null
  onChatSelect: (chatId: number) => void
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, selectedChatId, onChatSelect }) => {
  const [searchTerm, setSearchTerm] = useState<string>('')

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="w-80 h-full flex flex-col bg-gray-100 border-r border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
      {/* Header + Search */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-800 placeholder-gray-500 dark:bg-neutral-700 dark:text-white dark:placeholder-gray-400 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => {
          const isSelected = selectedChatId === chat.id
          return (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`p-4 border-b cursor-pointer transition-colors duration-200
                ${isSelected ? 'bg-blue-50 dark:bg-[#4267B2] border-r-2 ' : 'hover:bg-gray-50 dark:hover:bg-neutral-900'}
                border-gray-100 dark:border-neutral-700
                text-gray-900 dark:text-white`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{chat.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">{chat.unread}</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChatSidebar
