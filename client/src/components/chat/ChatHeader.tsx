'use client'
import React from 'react'
import { Phone, Video } from 'lucide-react'

interface ChatHeaderProps {
  name: string
  avatar: string
  online: boolean
}

export default function ChatHeader({ name, avatar, online }: ChatHeaderProps) {
  return (
    <div className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full" />
            {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-500">{online ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Phone className="h-5 w-5 cursor-pointer text-[#4267B2] hover:opacity-80 transition-opacity" />
          <Video className="h-5 w-5 cursor-pointer text-[#4267B2] hover:opacity-80 transition-opacity" />
        </div>
      </div>
    </div>
  )
}
