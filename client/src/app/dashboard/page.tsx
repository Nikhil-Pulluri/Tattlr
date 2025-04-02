'use client'
import React from 'react'
import ChatSection from '@/components/chat/ChatSection'
import { ChatProvider } from '@/context/chatContext'

export default function DashboardPage() {
  return (
    <ChatProvider>
      <div className="h-full">
        <ChatSection />
      </div>
    </ChatProvider>
  )
}
