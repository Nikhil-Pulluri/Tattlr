'use client'
import React, { useEffect, useState, useRef } from 'react'
import { Send } from 'lucide-react'
import { useChat } from '@/context/chatContext'
// import MessageInput from './MessageInput'
import Typing from '../Typing'
import { useSocket } from '@/context/socketContext'
interface ChatAreaProps {
  selectedChat: string | null
  selectedChatDetails?: {
    id: string
    chatId: string
    userId: string
    lastReadAt: Date | null
    user: {
      id: string
      name: string
      email: string
    }
    chat: {
      id: string
      lastmessage: string | null
      lastTime: Date | null
      unread: number
      messages: Array<{
        id: string
        text: string | null
        senderId: string
        createdAt: Date
      }>
      users: Array<{
        userId: string
        user: {
          id: string
          name: string
        }
      }>
    }
  }
  message: string
  onMessageChange: (message: string) => void
  onSend: () => void
}

export default function ChatArea({ selectedChat, selectedChatDetails, message, onMessageChange, onSend }: ChatAreaProps) {
  // const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const { socket } = useSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { selectedChatId } = useChat()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const handleTyping = (data: { senderId: string }) => {
      setTyping(true)

      // Reset typing state after a delay (e.g., 3 seconds)
      const timer = setTimeout(() => {
        setTyping(false)
      }, 2000)

      // Cleanup timer if the component unmounts or if typing stops
      return () => clearTimeout(timer)
    }

    socket?.on('typing', handleTyping)

    return () => {
      socket?.off('typing')
    }
  }, [socket, selectedChatDetails])

  useEffect(() => {
    scrollToBottom()
  }, [selectedChatDetails?.chat.messages])

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
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedChatDetails?.chat.users.find((u) => u.userId !== selectedChatDetails.userId)?.user.name ?? 'Select a chat'}</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedChatDetails?.chat.messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.senderId === selectedChatDetails.userId ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[min(80%,400px)] rounded-lg p-3 ${msg.senderId === selectedChatDetails.userId ? 'bg-[#4267B2] text-white' : 'bg-gray-100 dark:bg-zinc-800'}`}>
              <p className="break-words whitespace-pre-wrap text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {typing && selectedChat == selectedChatId && <Typing />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-2 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4267B2] dark:text-white"
            value={message}
            onChange={(e) => {
              onMessageChange(e.target.value)
              // setText(e.target.value);
              socket?.emit('typing', { receiver: selectedChatDetails?.chat.users.find((u) => u.userId !== selectedChatDetails.userId)?.userId })
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={!message.trim()}
            className={`p-2 rounded-full ${message.trim() ? 'bg-[#4267B2] text-white hover:bg-[#365899]' : 'bg-gray-300 dark:bg-zinc-700 cursor-not-allowed'} transition-colors`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
