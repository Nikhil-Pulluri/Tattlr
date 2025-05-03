'use client'
import React, { useState, useEffect } from 'react'
import ChatSidebar from './ChatSidebar'
import ChatArea from './ChatArea'
import NewChatDialog from './NewChatDialog'
import { useChat } from '@/context/chatContext'
import { useUserData, ChatUser, Chat as BackendChat, Message, User } from '@/context/userDataContext'
import { useAuth } from '@/context/jwtContext'
import { useSocket } from '@/context/socketContext'
import { useChatList } from '@/context/chatListContext'
import messageQueue from '@/lib/queues/messageQueue'

// interface ChatSidebarChat {
//   id: string
//   userId: string
//   name: string
//   lastMessage: string
//   time: string
//   unread: number
//   avatar: string
//   online: boolean
// }

interface ChatUserInterface {
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

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

export default function ChatSection() {
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const { selectedChatId, setSelectedChatId } = useChat()
  const [selectedChat, setSelectedChat] = useState<ChatUserInterface | undefined>()
  const { userData, setUserData } = useUserData()
  const { token } = useAuth()
  const { socket } = useSocket()
  const { chatUsers, setChatUsers } = useChatList()

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  // const chatUsers: ChatUser[] = userData?.chats ?? []

  const PresentchatUsers = userData?.chats

  const sidebarChats = PresentchatUsers?.sort((a, b) => {
    const timeA = a.chat.lastTime ? new Date(a.chat.lastTime).getTime() : 0
    const timeB = b.chat.lastTime ? new Date(b.chat.lastTime).getTime() : 0
    return timeB - timeA
  }).map((cu) => ({
    id: cu.chat.id,
    userId: cu.chat.users.find((u) => u.userId !== userData?.id)?.userId ?? '',
    name: cu.chat.users.find((u) => u.userId !== userData?.id)?.user.name ?? '',
    lastMessage: cu.chat.lastmessage ?? '',
    time: cu.chat.lastTime ? new Date(cu.chat.lastTime).toLocaleTimeString() : '',
    unread: cu.chat.unread,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cu.user?.name ?? 'default'}`,
    // avatar: '/bean.jpg',
    online: true, // TODO: Implement online status
  }))

  useEffect(() => {
    const transmitTypingStatus = async () => {
      socket?.emit('typing', { receiver: selectedChat?.chat?.users?.find((u) => u.userId !== userData?.id)?.userId })
    }
    transmitTypingStatus()
  }, [message])

  useEffect(() => {
    if (selectedChatId) {
      const foundChat = PresentchatUsers?.find((cu) => cu.chat.id === selectedChatId)
      setSelectedChat(foundChat)
    } else {
      console.log('No chat selected')
    }
  }, [selectedChatId, chatUsers, userData?.id])

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return

    const handleIncomingMessage = async (data: { message: string; userIds: string[]; chatId: string }) => {
      console.log('handleIncoming: ', Date.now())
      console.log('Received message:', data)

      // Refresh user data first

      setTimeout(async () => {
        console.log(Date.now())
        await refreshUserData()
        updateNext(data)
      }, 500)
    }

    const updateNext = (data: { message: string; userIds: string[]; chatId: string }) => {
      const updatedSelectedChat = userData?.chats.find((cu: ChatUser) => cu.chat.id === selectedChatId)
      if (updatedSelectedChat) {
        setSelectedChat(updatedSelectedChat)
      }


      if (!data?.userIds || !Array.isArray(data.userIds)) return

      const senderId = data.userIds.find((id) => id !== selectedChat?.userId) || data.userIds[0]

      setSelectedChat((prev) => {
        if (!prev) return prev

        // const senderId = Array.isArray(data.userIds) && data.userIds.length > 0 ? data.userIds.find((id) => id !== prev.userId) || data.userIds[0] : prev.userId

        return {
          ...prev,
          chat: {
            ...prev.chat,
            lastmessage: data.message,
            lastTime: new Date(),
            unread: prev.chat.unread + 1,
            messages: [
              ...prev.chat.messages,
              {
                id: generateRandomString(10),
                text: data.message, // ✅ Fix: extract the message string
                senderId: senderId,
                createdAt: new Date(),
              },
            ],
          },
        }
      })


      setChatUsers((prevChatUsers) => {
        const updatedChats = prevChatUsers.map((cu: ChatUser) => {
          if (cu.chat.id === selectedChatId) {
            return {
              ...cu,
              chat: {
                ...cu.chat,
                lastTime: new Date(),
                lastmessage: data.message,
              },
            }
          }
          return cu
        })
        return updatedChats
      })

      console.log(chatUsers)
    }

    // Set up the event listener
    socket.on('message', handleIncomingMessage)

    // Clean up the event listener when component unmounts
    return () => {
      socket.off('message', handleIncomingMessage)
    }
  }, [socket, userData?.id, selectedChatId, token, backendUrl, setChatUsers])

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
      if (data.chats) {
        setChatUsers(data.chats) // Use setChatUsers directly
      }
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

  const handleSend = async () => {
    console.log('handleSend: ', Date.now())
    if (message.trim() && selectedChatId && selectedChat) {
      try {
        socket?.emit('message', {
          userIds: selectedChat.chat.users.map((u) => u.userId),
          message: message,
          chatId: selectedChatId,
        })

        const msgAdded = await fetch('api/sendMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message, chatId: selectedChatId, senderId: userData?.id }),
        })

        if (!msgAdded.ok) {
          throw new Error('Failed to send message')
        }

        await refreshUserData()
        setMessage('')

        // Update selected chat with new data
        const updatedChatUsers = await fetch(`${backendUrl}/user/${userData?.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json())

        const updatedSelectedChat = updatedChatUsers.chats.find((cu: ChatUser) => cu.chat.id === selectedChatId)
        setSelectedChat(updatedSelectedChat)
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden mt-0.5">
      <div className="flex w-full">
        <div className="w-[350px] shrink-0">
          <ChatSidebar
            selectedChat={selectedChatId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onChatSelect={setSelectedChatId}
            onNewChat={() => setIsNewChatDialogOpen(true)}
            chats={sidebarChats ?? []}
          />
        </div>

        <ChatArea selectedChatDetails={selectedChat} selectedChat={selectedChatId} message={message} onMessageChange={setMessage} onSend={handleSend} />
      </div>

      <NewChatDialog isOpen={isNewChatDialogOpen} onClose={() => setIsNewChatDialogOpen(false)} onSubmit={handleNewChat} />
    </div>
  )
}
