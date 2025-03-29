'use client'
import React, { useState } from 'react'
import { Search, MoreVertical } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Chat {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  online: boolean
}

interface ChatSidebarProps {
  selectedChat: string | null
  searchQuery: string
  onSearchChange: (query: string) => void
  onChatSelect: (id: string | null) => void
  chats: Chat[]
}

export default function ChatSidebar({ selectedChat, searchQuery, onSearchChange, onChatSelect, chats }: ChatSidebarProps) {
  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="w-80 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chats</h2>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button className="p-2 text-gray-500 hover:text-[#4267B2] transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4267B2] dark:text-white transition-all"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto h-[calc(100vh-180px)]">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${selectedChat === chat.id ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}
            onClick={() => onChatSelect(chat.id)}
          >
            <div className="relative">
              <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full" />
              {chat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900 dark:text-white">{chat.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{chat.time}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{chat.lastMessage}</p>
                {chat.unread > 0 && <span className="ml-2 px-2 py-1 text-xs font-medium bg-[#4267B2] text-white rounded-full">{chat.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
