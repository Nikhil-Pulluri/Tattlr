'use client'
import React, { useState, useEffect } from 'react'
import { Send, Smile, Paperclip } from 'lucide-react'
import { useChat } from '@/context/chatContext'
import { useAuth } from '@/context/jwtContext'
import { useSocket } from '@/context/socketContext'

interface MessageInputProps {
  message: string
  onMessageChange: (message: string) => void
  onSend: () => void
}

export default function MessageInput({ message, onMessageChange, onSend }: MessageInputProps) {
  const [messageInput, setMessageInput] = useState('')
  const { selectedChatId } = useChat()
  const { user } = useAuth()
  const { socket } = useSocket()
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Log user and socket state when they change
  useEffect(() => {
    console.log('MessageInput - User state:', user)
    console.log('MessageInput - Socket state:', {
      hasSocket: !!socket,
      isConnected: socket?.connected,
    })
  }, [user, socket])

  // Handle typing status
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMessageChange(e.target.value)
    setMessageInput(e.target.value)

    // Emit typing status
    if (socket && selectedChatId && user?.id) {
      console.log('Emitting typing status:', {
        receiver: selectedChatId,
        isTyping: true,
        socketConnected: socket.connected,
        userData: user,
      })

      socket.emit('typing', {
        receiver: selectedChatId,
        isTyping: true,
      })

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }

      // Set new timeout to emit not typing after 500ms of inactivity
      const timeout = setTimeout(() => {
        console.log('Emitting not typing status:', {
          receiver: selectedChatId,
          isTyping: false,
          socketConnected: socket.connected,
          userData: user,
        })
        socket.emit('typing', {
          receiver: selectedChatId,
          isTyping: false,
        })
      }, 500)

      setTypingTimeout(timeout)
    } else {
      console.log('Socket or user data missing:', {
        hasSocket: !!socket,
        selectedChatId,
        userId: user?.id,
        userData: user,
        socketConnected: socket?.connected,
      })
    }
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [typingTimeout])

  // Handle message send
  const handleSend = () => {
    if (message.trim()) {
      // Emit not typing before sending
      if (socket && selectedChatId && user?.id) {
        socket.emit('typing', {
          receiver: selectedChatId,
          isTyping: false,
        })
      }
      onSend()
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-500 hover:text-[#4267B2] transition-colors">
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 rounded-full bg-gray-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4267B2] dark:text-white transition-all"
          value={message}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && message.trim()) {
              handleSend()
            }
          }}
        />
        <button className="p-2 text-gray-500 hover:text-[#4267B2] transition-colors">
          <Smile className="h-5 w-5" />
        </button>
        <button className="p-2 bg-[#4267B2] text-white rounded-full hover:bg-[#365899] transition-colors" onClick={handleSend} disabled={!message.trim()}>
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
