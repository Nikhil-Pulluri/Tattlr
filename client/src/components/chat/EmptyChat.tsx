'use client'
import React from 'react'
import { Send } from 'lucide-react'

export default function EmptyChat() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#4267B2] rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Your Messages</h3>
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    </div>
  )
}
