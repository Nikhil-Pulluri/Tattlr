'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import ChatSidebar from './chatSidebar'
import ChatWindow from './chatWindow'
import VideoConference from '../video/videoConference'
import { useUserStore } from '@/store/userStore'
import { useUserMessagesMap } from '@/hooks/getUserMessagesMap'
import { useUserConversations } from '@/hooks/getUserConversations'
import { useQueryClient } from '@tanstack/react-query'

interface Message {
  id: string
  conversationId: string
  senderId: string
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
  status: 'SENT' | 'DELIVERED' | 'READ'
  isDeleted: boolean
  isEdited: boolean
  content?: {
    text?: string
    mediaUrl?: string
    fileName?: string
    fileSize?: number
    mimeType?: string
    location?: {
      latitude: number
      longitude: number
      address?: string
    }
    systemAction?: 'USER_JOINED' | 'USER_LEFT' | 'USER_ADDED' | 'USER_REMOVED' | 'GROUP_CREATED' | 'GROUP_RENAMED'
  }
  replyToId?: string
  createdAt: string
  updatedAt: string
}

// Debounce utility function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const ChatLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  const { user } = useUserStore()
  const socketConnection = useUserStore((state) => state.socket)
  const queryClient = useQueryClient()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { data: conversations = [], refetch: refetchConversations, isLoading, isError, error } = useUserConversations(user?.id)

  const conversationIds = useMemo(() => conversations.map((conv) => conv.id), [conversations])

  const { data: messagesMap = {}, isLoading: messagesLoading, refetch: refetchMessages } = useUserMessagesMap(conversationIds)

  // Memoize the sorting function
  const sortMessages = useCallback((messages: Message[]): Message[] => {
    return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [])

  // Debounced refetch to avoid multiple rapid calls
  const debouncedRefetchConversations = useCallback(
    debounce(() => {
      refetchConversations()
    }, 500),
    [refetchConversations]
  )

  // Centralized message update function
  const updateMessagesInCache = useCallback(
    (conversationId: string, updateFn: (messages: Message[]) => Message[]) => {
      queryClient.setQueryData<{ [conversationId: string]: Message[] }>(['messagesMap', conversationIds], (oldData) => {
        if (!oldData) return { [conversationId]: updateFn([]) }

        const existingMessages = oldData[conversationId] || []
        const updatedMessages = updateFn(existingMessages)

        return {
          ...oldData,
          [conversationId]: updatedMessages,
        }
      })
    },
    [queryClient, conversationIds]
  )

  useEffect(() => {
    if (socketConnection && user?.id && conversationIds.length > 0) {
      conversationIds.forEach((conversationId) => {
        socketConnection.emit('joinRoom', {
          conversationId,
          userId: user.id,
        })
      })
    }
  }, [socketConnection, user?.id, conversationIds])

  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.senderId === user?.id) return

      updateMessagesInCache(message.conversationId, (existingMessages) => {
        const messageExists = existingMessages.some((msg) => msg.id === message.id)
        if (messageExists) return existingMessages

        const newMessages = [...existingMessages, message]
        return sortMessages(newMessages)
      })

      debouncedRefetchConversations()
    }

    socketConnection?.on('newMessage', handleNewMessage)

    return () => {
      socketConnection?.off('newMessage', handleNewMessage)
    }
  }, [socketConnection, user?.id, updateMessagesInCache, sortMessages, debouncedRefetchConversations])

  const selectedConversation = useMemo(() => conversations.find((conv) => conv.id === selectedConversationId) || null, [conversations, selectedConversationId])

  useEffect(() => {
    if (selectedConversationId && messagesMap[selectedConversationId]) {
      const sortedMessages = sortMessages(messagesMap[selectedConversationId])
      setMessages(sortedMessages)
    } else if (selectedConversationId) {
      setMessages([])
    }
  }, [selectedConversationId, messagesMap, sortMessages])

  const handleConversationSelect = useCallback((conversationId: string): void => {
    setSelectedConversationId(conversationId)
  }, [])

  const handleSendMessage = useCallback(
    (messageText: string): void => {
      if (!selectedConversationId || !user) return

      const optimisticMessage: Message = {
        id: `temp_${Date.now()}_${Math.random()}`, // Use temp prefix for optimistic updates
        conversationId: selectedConversationId,
        senderId: user.id,
        messageType: 'TEXT',
        status: 'SENT',
        isDeleted: false,
        isEdited: false,
        content: { text: messageText },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Optimistic update - add message immediately
      setMessages((prev) => sortMessages([...prev, optimisticMessage]))

      updateMessagesInCache(selectedConversationId, (existingMessages) => {
        return sortMessages([...existingMessages, optimisticMessage])
      })

      try {
        socketConnection?.emit('sendMessage', {
          conversationId: selectedConversationId,
          senderId: user.id,
          messageType: 'TEXT',
          content: {
            text: messageText,
          },
        })

        // Only refetch conversations after successful send (debounced)
        debouncedRefetchConversations()
      } catch (error) {
        console.log('error sending message via socket', error)

        // Rollback optimistic update
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id))

        updateMessagesInCache(selectedConversationId, (existingMessages) => {
          return existingMessages.filter((msg) => msg.id !== optimisticMessage.id)
        })

        throw error
      }
    },
    [selectedConversationId, user, socketConnection, updateMessagesInCache, sortMessages, debouncedRefetchConversations]
  )

  const handleStartVideoCall = () => {
    if (selectedConversationId) {
      setIsVideoCallActive(true)
      setIsVideoModalOpen(true)
    }
  }

  const handleLeaveVideoCall = () => {
    setIsVideoCallActive(false)
    setIsVideoModalOpen(false)
  }

  const handleMinimizeVideo = () => {
    setIsVideoModalOpen(false)
    // Keep isVideoCallActive true to show the status indicator
  }

  const handleExpandVideo = () => {
    setIsVideoModalOpen(true)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to minimize video call
      if (event.key === 'Escape' && isVideoModalOpen) {
        handleMinimizeVideo()
      }

      // Ctrl/Cmd + D to toggle video call
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && selectedConversationId) {
        event.preventDefault()
        if (isVideoCallActive) {
          if (isVideoModalOpen) {
            handleMinimizeVideo()
          } else {
            handleExpandVideo()
          }
        } else {
          handleStartVideoCall()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVideoModalOpen, isVideoCallActive, selectedConversationId])

  if (!isClient) {
    return (
      <div className="flex h-screen bg-white dark:bg-neutral-800">
        <div className="w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700">
          <div className="p-4">Loading...</div>
        </div>
        <div className="hidden sm:flex flex-1 items-center justify-center">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-800 relative">
      {/* Main stable layout - always visible */}
      <ChatSidebar conversations={conversations} selectedConversationId={selectedConversationId} onConversationSelect={handleConversationSelect} />

      <ChatWindow conversation={selectedConversation} messages={messages} onSendMessage={handleSendMessage} currentUserId={user?.id || 'current-user-id'} onStartVideoCall={handleStartVideoCall} />

      {/* Video call status indicator (when video is active but modal is closed) */}
      {isVideoCallActive && !isVideoModalOpen && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>Video call active</span>
            <button onClick={handleExpandVideo} className="ml-2 px-2 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs transition-colors">
              Return to call
            </button>
          </div>
        </div>
      )}

      {/* Video Conference Modal */}
      {isVideoCallActive && isVideoModalOpen && selectedConversationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-75"></div>

          {/* Modal Content */}
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4 bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
              <h3 className="text-white font-medium">Video Call</h3>
              <div className="flex space-x-2">
                <button onClick={handleMinimizeVideo} className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded text-sm transition-colors">
                  Minimize
                </button>
                <button onClick={handleLeaveVideoCall} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                  End Call
                </button>
              </div>
            </div>

            {/* Video Conference Component */}
            <VideoConference conversationId={selectedConversationId} onLeaveCall={handleLeaveVideoCall} onReturnToChat={handleMinimizeVideo} />
          </div>
        </div>
      )}

      {children}
    </div>
  )
}

export default ChatLayout

// ---------------------------------------------------------------------------------------

// 'use client'
// import React, { useState, useEffect } from 'react'
// import ChatSidebar from './chatSidebar'
// import ChatWindow from './chatWindow'
// import { useUserStore } from '@/store/userStore'
// import { useUserMessagesMap } from '@/hooks/getUserMessagesMap'
// import { useUserConversations } from '@/hooks/getUserConversations'
// import { useQueryClient } from '@tanstack/react-query'

// interface Message {
//   id: string
//   conversationId: string
//   senderId: string
//   messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'SYSTEM'
//   status: 'SENT' | 'DELIVERED' | 'READ'
//   isDeleted: boolean
//   isEdited: boolean
//   content?: {
//     text?: string
//     mediaUrl?: string
//     fileName?: string
//     fileSize?: number
//     mimeType?: string
//     location?: {
//       latitude: number
//       longitude: number
//       address?: string
//     }
//     systemAction?: 'USER_JOINED' | 'USER_LEFT' | 'USER_ADDED' | 'USER_REMOVED' | 'GROUP_CREATED' | 'GROUP_RENAMED'
//   }
//   replyToId?: string
//   createdAt: string
//   updatedAt: string
// }

// const ChatLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
//   const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
//   const [messages, setMessages] = useState<Message[]>([])
//   const [isClient, setIsClient] = useState(false)
//   const { user, userStatus } = useUserStore()

//   const socketConnection = useUserStore((state) => state.socket)

//   const queryClient = useQueryClient()

//   useEffect(() => {
//     setIsClient(true)
//   }, [])

//   const { data: conversations = [], refetch: refetchConversations, isLoading, isError, error } = useUserConversations(user?.id)

//   const conversationIds = conversations.map((conv) => conv.id)

//   const { data: messagesMap = {}, isLoading: messagesLoading, refetch: refetchMessages } = useUserMessagesMap(conversationIds)

//   useEffect(() => {
//     if (socketConnection && user?.id && conversationIds.length > 0) {
//       // console.log(conversationIds.length)
//       conversationIds.forEach((conversationId) => {
//         socketConnection.emit('joinRoom', {
//           conversationId,
//           userId: user.id,
//         })
//       })
//     }
//   }, [socketConnection, user?.id, conversationIds])

//   const sortMessages = (messages: Message[]): Message[] => {
//     return [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
//   }

//   useEffect(() => {
//     const handler = (message: Message) => {
//       if (message.senderId !== user?.id) {
//         // console.log('message received', message)

//         // ✅ Update query cache safely
//         queryClient.setQueryData<{ [conversationId: string]: Message[] }>(['messagesMap', conversationIds], (oldData) => {
//           if (!oldData) return {}

//           const existingMessages = oldData[message.conversationId] || []

//           // Check if message already exists to prevent duplicates
//           const messageExists = existingMessages.some((msg) => msg.id === message.id)
//           if (messageExists) {
//             return oldData
//           }

//           const updatedMessages = sortMessages([...existingMessages, message])

//           // console.log('updatedMessages', updatedMessages)

//           setTimeout(() => {
//             refetchConversations()
//           }, 300)

//           return {
//             ...oldData,
//             [message.conversationId]: updatedMessages,
//           }
//         })
//       }
//     }

//     socketConnection?.on('newMessage', handler)

//     return () => {
//       socketConnection?.off('newMessage', handler)
//     }
//   }, [socketConnection, user?.id, conversationIds, queryClient])

//   const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId) || null

//   // Update messages from query cache, ensuring they're sorted
//   useEffect(() => {
//     if (selectedConversationId && messagesMap[selectedConversationId]) {
//       refetchMessages()
//       const sortedMessages = sortMessages(messagesMap[selectedConversationId])
//       setMessages(sortedMessages)
//     } else if (selectedConversationId) {
//       setMessages([])
//     }
//   }, [selectedConversationId, messagesMap])

//   const handleConversationSelect = (conversationId: string): void => {
//     setSelectedConversationId(conversationId)
//   }

//   const handleSendMessage = (messageText: string): void => {
//     if (selectedConversationId && user) {
//       const newMessage: Message = {
//         id: `msg_${Date.now()}_${Math.random()}`, // More unique ID generation
//         conversationId: selectedConversationId,
//         senderId: user.id,
//         messageType: 'TEXT',
//         status: 'SENT',
//         isDeleted: false,
//         isEdited: false,
//         content: { text: messageText },
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       }

//       // Update local state immediately for better UX
//       setMessages((prev) => sortMessages([...prev, newMessage]))

//       // Update query cache immediately
//       queryClient.setQueryData<{ [conversationId: string]: Message[] }>(['messagesMap', conversationIds], (oldData) => {
//         if (!oldData) return { [selectedConversationId]: [newMessage] }

//         const existingMessages = oldData[selectedConversationId] || []
//         const updatedMessages = sortMessages([...existingMessages, newMessage])

//         setTimeout(() => {
//           refetchConversations()
//         }, 300)

//         return {
//           ...oldData,
//           [selectedConversationId]: updatedMessages,
//         }
//       })

//       try {
//         socketConnection?.emit('sendMessage', {
//           conversationId: selectedConversationId,
//           senderId: user.id,
//           messageType: 'TEXT',
//           content: {
//             text: messageText,
//           },
//         })
//       } catch (error) {
//         console.log('error sending message via socket', error)

//         // Rollback on error
//         setMessages((prev) => prev.filter((msg) => msg.id !== newMessage.id))
//         queryClient.setQueryData<{ [conversationId: string]: Message[] }>(['messagesMap', conversationIds], (oldData) => {
//           if (!oldData) return {}

//           const existingMessages = oldData[selectedConversationId] || []
//           const rolledBackMessages = existingMessages.filter((msg) => msg.id !== newMessage.id)

//           return {
//             ...oldData,
//             [selectedConversationId]: rolledBackMessages,
//           }
//         })

//         throw error
//       }
//     }
//   }

//   if (!isClient) {
//     return (
//       <div className="flex h-screen bg-white dark:bg-neutral-800">
//         <div className="w-full sm:w-80 md:w-96 lg:w-80 xl:w-96 bg-white dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700">
//           <div className="p-4">Loading...</div>
//         </div>

//         <div className="hidden sm:flex flex-1 items-center justify-center">
//           <div>Loading...</div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex h-screen w-full bg-white dark:bg-neutral-800">
//       <ChatSidebar conversations={conversations} selectedConversationId={selectedConversationId} onConversationSelect={handleConversationSelect} />
//       <ChatWindow conversation={selectedConversation} messages={messages} onSendMessage={handleSendMessage} currentUserId={user?.id || 'current-user-id'} />
//       {children}
//     </div>
//   )
// }

// export default ChatLayout
