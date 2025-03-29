'use client'
import React, { useState, useEffect } from 'react'
import { Send, Smile, Paperclip } from 'lucide-react'
import { useChat } from '@/context/chatContext'

interface MessageInputProps {
  message: string
  onMessageChange: (message: string) => void
  onSend: () => void
}

export default function MessageInput({ message, onMessageChange, onSend }: MessageInputProps) {
  const { setIsTyping, socket } = useChat()
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  // Handle typing status
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMessageChange(e.target.value)

    // Set typing status to true
    setIsTyping(true)

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Set new timeout to set typing status to false after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, 2000)

    setTypingTimeout(timeout)
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
      // Clear typing status before sending
      setIsTyping(false)
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
          onKeyPress={(e) => {
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
