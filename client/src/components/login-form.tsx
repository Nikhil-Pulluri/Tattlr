'use client'
import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeClosed } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
// import { useUser } from '@/context/userContext'
// import { io, Socket } from 'socket.io-client'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [context, setContext] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'email' | 'mobile' | 'username'>('email')
  // const [socket, setSocket] = useState<Socket | null>(null)

  // const { setUser, userStatus } = useUser()
  const { setUser, userStatus } = useUserStore()

  const router = useRouter()
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL

  useEffect(() => {
    if (userStatus) router.push('dashboard/chats')
    console.log(userStatus, 'from login')
    // console.log(user)
  }, [userStatus])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      var body = {}

      switch (mode) {
        case 'email':
          body = {
            email: context,
            password: password,
          }
          break
        case 'mobile':
          body = {
            mobile: context,
            password: password,
          }
          break
        case 'username':
          body = {
            username: context,
            password: password,
          }
          break
      }

      const response = await fetch(`/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()

      setContext('')
      setPassword('')

      if (data.status === 'success') {
        const userDetails = data.user

        setUser(userDetails)
      }

      // if (!socket) {
      //   const socketIo = io(`${backendUrl}/chat`, {
      //     transports: ['websocket'],
      //   })

      //   setSocket(socketIo)

      //   socketIo.on('connect', () => {
      //     console.log('Connected to chat WebSocket server')
      //   })

      //   socketIo.on('join', (msg) => {
      //     console.log(msg)
      //   })

      //   socketIo.emit('join', { userId: data.userId })
      // }

      // router.push('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <div className="max-w-xl w-full mx-auto rounded-none md:rounded-2xl p-6 md:p-10 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-2xl text-neutral-800 dark:text-neutral-200">Welcome back!</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">Login to your account</p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-6">
          <Label className="text-neutral-800 dark:text-neutral-200">Login with:</Label>
          <div className="flex space-x-4">
            <div>
              <input type="radio" id="email" name="mode" value="email" checked={mode === 'email'} onChange={() => setMode('email')} />
              <label htmlFor="email" className="ml-2">
                Email
              </label>
            </div>
            <div>
              <input type="radio" id="mobile" name="mode" value="mobile" checked={mode === 'mobile'} onChange={() => setMode('mobile')} />
              <label htmlFor="mobile" className="ml-2">
                Mobile
              </label>
            </div>
            <div>
              <input type="radio" id="username" name="mode" value="username" checked={mode === 'username'} onChange={() => setMode('username')} />
              <label htmlFor="username" className="ml-2">
                Username
              </label>
            </div>
          </div>
        </div>

        <LabelInputContainer className="mb-6">
          <Label htmlFor="context">Enter {mode === 'email' ? 'Email' : mode === 'mobile' ? 'Mobile' : 'Username'}</Label>
          <Input
            id="context"
            placeholder={mode === 'email' ? 'youremail@example.com' : mode === 'mobile' ? '123-456-7890' : '@username'}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            type="text"
            className="py-3 px-4" // Make input field wider
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-6">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 pr-10" // Make input field wider and adjust padding for icon
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
              {showPassword ? <Eye className="h-4 w-4 text-gray-500" onClick={() => setShowPassword(false)} /> : <EyeClosed className="h-4 w-4 text-gray-500" onClick={() => setShowPassword(true)} />}
            </div>
          </div>
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-12 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Log in &rarr;
          <BottomGradient />
        </button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
      </form>
    </div>
  )
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  )
}

const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('flex flex-col space-y-4 w-full', className)}>{children}</div>
}
