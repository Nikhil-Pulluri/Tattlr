'use client'
import React from 'react'

interface Chat {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  online: boolean
}

interface ChatListProps {
  chats: Chat[]
  selectedChat: string | null
  onChatSelect: (chatId: string) => void
}

export default function ChatList({ chats, selectedChat, onChatSelect }: ChatListProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${selectedChat === chat.id ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}
          onClick={() => onChatSelect(chat.id)}
        >
          <div className="relative">
            <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full" />
            {chat.online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>}
          </div>
          <div className="flex-1 ml-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900 dark:text-white">{chat.name}</h3>
              <span className="text-xs text-gray-500">{chat.time}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500 truncate max-w-[180px]">{chat.lastMessage}</p>
              {chat.unread > 0 && <span className="bg-[#4267B2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{chat.unread}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
