'use client'
import React from 'react'
import { Phone, Video } from 'lucide-react'
import MessageInput from './MessageInput'

interface ChatAreaProps {
  selectedChat: string | null
  message: string
  onMessageChange: (message: string) => void
  onSend: () => void
}

export default function ChatArea({ selectedChat, message, onMessageChange, onSend }: ChatAreaProps) {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select a chat to start messaging</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a conversation from the sidebar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src="https://via.placeholder.com/40" alt="User avatar" className="w-10 h-10 rounded-full" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">User Name</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-[#4267B2] transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-[#4267B2] transition-colors">
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">{/* Messages will be rendered here */}</div>

      {/* Message Input */}
      <MessageInput message={message} onMessageChange={onMessageChange} onSend={onSend} />
    </div>
  )
}
