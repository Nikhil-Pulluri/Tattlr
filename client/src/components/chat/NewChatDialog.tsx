'use client'
import React, { useState } from 'react'
import { X } from 'lucide-react'

interface NewChatDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userIds: string[]) => void
}

export default function NewChatDialog({ isOpen, onClose, onSubmit }: NewChatDialogProps) {
  const [userIds, setUserIds] = useState('')

  const handleSubmit = () => {
    if (userIds.trim()) {
      // Split the input by commas and trim whitespace
      const userIdArray = userIds
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id)
      onSubmit(userIdArray)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Chat</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter User IDs (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g., user1, user2, user3"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4267B2] dark:text-white"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!userIds.trim()}
            className={`px-4 py-2 rounded-lg transition-colors ${!userIds.trim() ? 'bg-gray-300 dark:bg-zinc-700 cursor-not-allowed' : 'bg-[#4267B2] text-white hover:bg-[#365899]'}`}
          >
            Create Chat
          </button>
        </div>
      </div>
    </div>
  )
}
