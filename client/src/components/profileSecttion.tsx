'use client'

type Gender = 'MALE' | 'FEMALE'
type UserStatus = 'AVAILABLE' | 'AWAY' | 'BUSY' | 'INVISIBLE'

interface ProfileSectionProps {
  user: {
    id: string
    name: string
    username: string
    email: string
    mobile: string
    profilePicture?: string
    gender: Gender
    isOnline: boolean
    lastSeen: Date
    status: UserStatus
    createdAt: Date
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <div className="w-full h-full bg-gray-100 dark:bg-neutral-800 p-8 flex flex-col">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile</h1>
      </div>

      {/* Content container */}
      <div className="flex flex-row gap-12 flex-1">
        {/* Profile Picture + Name Section */}
        <div className="flex flex-col w-1/3 items-center">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={`${user.name}'s profile`} className="w-48 h-48 rounded-full object-cover mb-6 border-4 border-blue-500" />
          ) : (
            <div className="w-48 h-48 rounded-full bg-blue-500 flex items-center justify-center mb-6 text-white text-8xl font-bold">{user.name.charAt(0).toUpperCase()}</div>
          )}
          <h2 className="text-4xl font-semibold text-gray-900 dark:text-white mb-2">{user.name}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">@{user.username}</p>

          {/* Online status */}
          <div className="flex items-center space-x-3 mb-8">
            <span className={`w-4 h-4 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">{user.isOnline ? 'Online' : `Last seen: ${formatDate(new Date(user.lastSeen))}`}</span>
          </div>

          {/* Action button */}
          <button type="button" className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Edit Profile
          </button>
        </div>

        {/* User details */}
        <div className="flex flex-col w-2/3">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Email</h3>
              <p className="text-lg text-gray-900 dark:text-white">{user.email}</p>
            </div>

            <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile</h3>
              <p className="text-lg text-gray-900 dark:text-white">{user.mobile}</p>
            </div>

            <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</h3>
              <p className="text-lg text-gray-900 dark:text-white capitalize">{user.gender.toLowerCase()}</p>
            </div>

            <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-sm">
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
              <p className="text-lg text-gray-900 dark:text-white">{user.status}</p>
            </div>

            <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-sm col-span-2">
              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">Account Created</h3>
              <p className="text-lg text-gray-900 dark:text-white">{formatDate(new Date(user.createdAt))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
