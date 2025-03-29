'use client'
import React from 'react'

interface Message {
  id: string
  text: string
  time: string
  isSent: boolean
}

interface MessageListProps {
  messages: Message[]
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-900">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}>
          <div className={`rounded-2xl py-2 px-4 max-w-[70%] shadow-sm ${message.isSent ? 'bg-[#4267B2] text-white' : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white'}`}>
            <p>{message.text}</p>
            <span className={`text-xs mt-1 block ${message.isSent ? 'opacity-75' : 'text-gray-500'}`}>{message.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
