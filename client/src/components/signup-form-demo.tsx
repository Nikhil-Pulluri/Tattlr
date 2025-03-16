'use client'
import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeClosed } from 'lucide-react'
import { useAuth } from '@/context/jwtContext'

export default function SignupFormDemo() {
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const { signIn, user, token } = useAuth()

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()

  //   // Log the form data
  //   // console.log({
  //   //   firstName,
  //   //   lastName,
  //   //   email,
  //   //   username,
  //   //   mobile,
  //   //   password,
  //   //   confirmPassword,
  //   // })

  //   const name = firstName + ' ' + lastName
  //   const body = {
  //     email: email,
  //     name: name,
  //     username: username,
  //     password: password,
  //     phnum: mobile,
  //   }

  //   const response = await fetch(`${backendUrl}/user/create`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(body),
  //   })

  //   const data = await response.json()
  //   console.log(data)

  //   if (data.email === email) {
  //     const loginResponse = await fetch(`${backendUrl}/auth/login`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         email: email,
  //         password: password,
  //       }),
  //     })

  //     const loginData = await loginResponse.json()
  //     signIn(loginData.access_token)
  //     console.log(user)
  //     console.log(token)
  //     console.log(loginData)
  //   }

  //   // reset the form
  //   setFirstName('')
  //   setLastName('')
  //   setEmail('')
  //   setUsername('')
  //   setMobile('')
  //   setPassword('')
  //   setConfirmPassword('')
  // }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const name = firstName + ' ' + lastName
    const body = {
      email: email,
      name: name,
      username: username,
      password: password,
      phnum: mobile,
    }

    try {
      // Create user (sign up)
      const response = await fetch(`${backendUrl}/user/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      console.log(data)

      if (response.status === 201 && data.email === email) {
        const loginResponse = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        })

        const loginData = await loginResponse.json()

        if (loginResponse.status === 200) {
          signIn(loginData.access_token)
          console.log('Login successful:', loginData)
        } else {
          console.error('Login failed:', loginData)
        }
      } else {
        console.error('Signup failed:', data)
      }
    } catch (error) {
      console.error('Error during signup or login:', error)
    }

    // console.log('user:', user)
    // console.log('token:', token)

    // Reset the form
    // setFirstName('')
    // setLastName('')
    // setEmail('')
    // setUsername('')
    // setMobile('')
    // setPassword('')
    // setConfirmPassword('')
  }

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Welcome!</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">Create an account to continue</p>

      <form className="mt-5" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input id="firstname" placeholder="Tyler" value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input id="lastname" placeholder="Durden" value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" />
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" placeholder="projectmayhem@fc.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input id="mobile" placeholder="123-456-7890" value={mobile} onChange={(e) => setMobile(e.target.value)} type="text" />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="@username" value={username} onChange={(e) => setUsername(e.target.value)} type="text" />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10" // Add right padding for the icon
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
              {showPassword ? <Eye className="h-4 w-4 text-gray-500" onClick={() => setShowPassword(false)} /> : <EyeClosed className="h-4 w-4 text-gray-500" onClick={() => setShowPassword(true)} />}
            </div>
          </div>
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="confirm-password">Confirm your password</Label>
          <Input id="confirm-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" />
        </LabelInputContainer>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Sign up &rarr;
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
  return <div className={cn('flex flex-col space-y-2 w-full', className)}>{children}</div>
}
