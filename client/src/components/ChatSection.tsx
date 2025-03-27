'use client'
import React, { useState } from 'react'
import { Search, MoreVertical, Phone, Video, Send, Smile, Paperclip } from 'lucide-react'

interface Chat {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  online: boolean
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

export default function ChatSection() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')

  // Dummy data for chats
  const chats: Chat[] = [
    {
      id: '1',
      name: 'John Doe',
      lastMessage: 'Hey, how are you?',
      time: '10:30 AM',
      unread: 2,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      online: true,
    },
    {
      id: '2',
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#4267B2] text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Messages</h2>
            <MoreVertical className="h-5 w-5 cursor-pointer hover:opacity-80 transition-opacity" />
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search messages"
              className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4267B2] dark:text-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors ${selectedChat === chat.id ? 'bg-gray-100 dark:bg-zinc-800' : ''}`}
              onClick={() => setSelectedChat(chat.id)}
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
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <img src={chats.find((chat) => chat.id === selectedChat)?.avatar || DEFAULT_AVATAR} alt="Profile" className="w-10 h-10 rounded-full" />
                    {chats.find((chat) => chat.id === selectedChat)?.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">{chats.find((chat) => chat.id === selectedChat)?.name}</h3>
                    <p className="text-sm text-gray-500">{chats.find((chat) => chat.id === selectedChat)?.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="h-5 w-5 cursor-pointer text-[#4267B2] hover:opacity-80 transition-opacity" />
                  <Video className="h-5 w-5 cursor-pointer text-[#4267B2] hover:opacity-80 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-900">
              <div className="flex justify-end">
                <div className="bg-[#4267B2] text-white rounded-2xl py-2 px-4 max-w-[70%] shadow-sm">
                  <p>Hey! How are you?</p>
                  <span className="text-xs opacity-75 mt-1 block">10:30 AM</span>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl py-2 px-4 max-w-[70%] shadow-sm">
                  <p className="text-gray-900 dark:text-white">I'm good, thanks! How about you?</p>
                  <span className="text-xs text-gray-500 mt-1 block">10:31 AM</span>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-500 hover:text-[#4267B2] transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 rounded-full bg-gray-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4267B2] dark:text-white transition-all"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button className="p-2 text-gray-500 hover:text-[#4267B2] transition-colors">
                  <Smile className="h-5 w-5" />
                </button>
                <button className="p-2 bg-[#4267B2] text-white rounded-full hover:bg-[#365899] transition-colors">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#4267B2] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Your Messages</h3>
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
