'use client'
import React from 'react'
import ProfileSection from '@/components/profileSecttion'
// import { useUser } from '@/context/userContext'
import { useUserStore } from '@/store/userStore'

function profile() {
  const { user, userStatus } = useUserStore()
  console.log(userStatus)
  console.log(user)
  return (
    <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-800">
      {userStatus && user && <ProfileSection user={user} />}
    </div>
  )
}

export default profile
