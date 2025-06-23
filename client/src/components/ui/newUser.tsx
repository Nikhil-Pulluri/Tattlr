'use client'

import React, { useState, useEffect } from 'react'
import { Search, X, UserPlus, Loader2, User } from 'lucide-react'

interface User {
  id: string
  name: string
  username: string
  email: string
  mobile: string
  profilePicture?: string
  gender: 'MALE' | 'FEMALE'
  isOnline: boolean
  lastSeen: string
  status: 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChat: (username: string) => void
  isLoading?: boolean
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose, onCreateChat, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL

  const newSearch = async (username: string) => {
    const users = await fetch(`${backend}/user/search?username=${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return users
  }

  const handleSearch = async (searchTerm: string) => {
    const usersRaw = await newSearch(searchTerm)
    const users: User[] = await usersRaw.json()
    const results = users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setSearchResults(results)
  }

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(() => {
      handleSearch(searchTerm)
      setIsSearching(false)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSearchResults([])
      setSelectedUser(null)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleCreateChat = () => {
    if (selectedUser) {
      onCreateChat(selectedUser.id)
    } else if (searchTerm.trim()) {
      onCreateChat(searchTerm.trim())
    }
  }

  const getStatusColor = (status: string, isOnline: boolean) => {
    if (!isOnline) return 'bg-gray-400'
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-500'
      case 'AWAY':
        return 'bg-yellow-500'
      case 'BUSY':
        return 'bg-red-500'
      case 'INVISIBLE':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-800 rounded-lg shadow-2xl transform transition-all duration-300 scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Start New Chat</span>
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 text-gray-800 placeholder-gray-500 dark:bg-neutral-700 dark:text-white dark:placeholder-gray-400 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              autoFocus
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />}
          </div>

          {searchTerm && (
            <div className="mb-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Found {searchResults.length} user(s)</p>
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                        selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-600 flex items-center justify-center">
                            {user.profilePicture ? <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover" /> : <User className="w-5 h-5 text-gray-500" />}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-neutral-800 ${getStatusColor(user.status, user.isOnline)}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                        </div>
                        {user.isOnline && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No users found</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try searching with a different username</p>
                </div>
              )}
            </div>
          )}

          {selectedUser && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Selected user:</p>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-neutral-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border border-white dark:border-neutral-800 ${getStatusColor(selectedUser.status, selectedUser.isOnline)}`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{selectedUser.username}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-neutral-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200">
            Cancel
          </button>
          <button
            onClick={handleCreateChat}
            disabled={(!selectedUser && !searchTerm.trim()) || isLoading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Start Chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewChatModal
