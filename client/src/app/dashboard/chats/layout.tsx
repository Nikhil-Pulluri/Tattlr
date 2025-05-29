import { Metadata } from 'next'
import ChatLayout from '@/components/chat/chatLayout'

const Metadata: Metadata = {
  title: 'Tattlr | Chats',
  description: 'Real Time Messaging',
}

export default function chatsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ChatLayout>{children}</ChatLayout>
}
