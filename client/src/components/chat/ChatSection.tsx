'use client'
import React, { useState, useEffect } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatArea from './ChatArea'
import NewChatDialog from './NewChatDialog'
import { useChat } from '@/context/chatContext'
import { useUserData, ChatUser, Chat as BackendChat, Message, User } from '@/context/userDataContext'
import { useAuth } from '@/context/jwtContext'

interface ChatSidebarChat {
  id: string
  userId: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
  online: boolean
}

export default function ChatSection() {
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const { selectedChatId, setSelectedChatId } = useChat()
  const { userData, setUserData } = useUserData()
  const { token } = useAuth()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const chatUsers: ChatUser[] = userData?.chats ?? []

  // Transform backend chat data to sidebar chat format
  const sidebarChats: ChatSidebarChat[] = chatUsers.map((cu) => ({
    id: cu.chat.id,
    userId: cu.chat.users.find((u) => u.userId !== userData?.id)?.user.id ?? '',
    name: cu.chat.users.find((u) => u.userId !== userData?.id)?.user.name ?? '',
    lastMessage: cu.chat.lastmessage ?? '',
    time: cu.chat.lastTime?.toLocaleTimeString() ?? '',
    unread: cu.chat.unread,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cu.user?.name ?? 'default'}`,
    online: true, // TODO: Implement online status
  }))

  // Debug: Monitor selectedChatId changes
  useEffect(() => {
    console.group('Selected Chat Debug')
    console.log('Selected Chat ID:', selectedChatId)

    if (selectedChatId) {
      const selectedChat = chatUsers.find((cu) => cu.chat.id === selectedChatId)
      if (selectedChat) {
        console.log('Selected Chat Details:', {
          id: selectedChat.chat.id,
          lastMessage: selectedChat.chat.lastmessage,
          lastTime: selectedChat.chat.lastTime,
          unread: selectedChat.chat.unread,
          messages: selectedChat.chat.messages,
          users: selectedChat.chat.users.map((u) => ({
            id: u.userId,
            name: u.user.name,
          })),
        })
      } else {
        console.warn('Selected chat not found in chatUsers array')
      }
    } else {
      console.log('No chat selected')
    }

    console.log(
      'Available Chats:',
      chatUsers.map((cu) => ({
        id: cu.chat.id,
        name: cu.chat.users.find((u) => u.userId !== userData?.id)?.user.name,
      }))
    )
    console.groupEnd()
  }, [selectedChatId, chatUsers, userData?.id])

  const refreshUserData = async () => {
    try {
      const response = await fetch(`${backendUrl}/user/${userData?.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      setUserData(data)
    } catch (error) {
      console.error('Error refreshing user data:', error)
    }
  }

  const handleNewChat = async (userIds: string[]) => {
    try {
      const response = await fetch(`${backendUrl}/chat/create-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userIds }),
      })

      if (!response.ok) {
        throw new Error('Failed to create chat')
      }

      const newChat = await response.json()
      console.log('New chat created:', newChat)

      // Refresh user data to get the updated chat list
      await refreshUserData()

      // Select the newly created chat
      if (newChat.id) {
        setSelectedChatId(newChat.id)
      }
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  // useEffect(() => {
  //   if (selectedChatId) {
  //     const selectedChat = chatUsers.find((cu) => cu.chat.id === selectedChatId)
  //     if (selectedChat) {
  //       setMessage(selectedChat.chat.lastmessage ?? '')
  //     }
  //   }
  // }, [selectedChatId])

  const handleSend = () => {
    if (message.trim() && selectedChatId) {
      // TODO: Implement message sending logic
      setMessage('')
    }
  }

  return (
    <div className="flex h-full">
      <ChatSidebar
        selectedChat={selectedChatId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onChatSelect={setSelectedChatId}
        onNewChat={() => setIsNewChatDialogOpen(true)}
        chats={sidebarChats}
      />
      <ChatArea selectedChat={selectedChatId} message={message} onMessageChange={setMessage} onSend={handleSend} />
      <NewChatDialog isOpen={isNewChatDialogOpen} onClose={() => setIsNewChatDialogOpen(false)} onSubmit={handleNewChat} />
    </div>
  )
}
