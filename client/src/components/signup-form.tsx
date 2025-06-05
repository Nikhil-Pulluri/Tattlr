'use client'
import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeClosed } from 'lucide-react'
import { useUser } from '@/context/userContext'
import { useRouter } from 'next/navigation'
export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [gender, setGender] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const router = useRouter()
  const { setUser, userStatus } = useUser()

  useEffect(() => {
    if (userStatus) router.push('dashboard/chats')
  }, [userStatus])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    setPasswordError(null)

    let profilePrictureURL: string = ''

    if (profilePicture) {
      const formData = new FormData()
      formData.append('file', profilePicture)
      formData.append('upload_preset', 'profile-tattlr')

      try {
        const cloudinaryRes = await fetch(`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}`, {
          method: 'POST',
          body: formData,
        })

        const cloudinaryData = await cloudinaryRes.json()
        profilePrictureURL = cloudinaryData.secure_url
        console.log('Cloudinary URL:', cloudinaryData.secure_url)
      } catch (err) {
        console.error('Cloudinary upload failed:', err)
        return
      }
    }

    const name = firstName + ' ' + lastName
    const body = {
      name,
      username,
      email,
      mobile,
      password,
      gender,
      profilePicture: profilePrictureURL || '',
    }

    try {
      console.log('called')
      const response = await fetch(`/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (data.message === 'success') {
        var loginBody = {
          email: email,
          password: password,
        }
        try {
          const loginResponse = await fetch('api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginBody),
          })

          const loginData = await loginResponse.json()
          if (loginData.status === 'success') {
            setUser(loginData.user)
          }
        } catch (error) {
          console.log(error)
          throw error
        }
      }
    } catch (error) {
      console.error('Error during signup or login:', error)
    }

    setFirstName('')
    setLastName('')
    setEmail('')
    setUsername('')
    setMobile('')
    setPassword('')
    setConfirmPassword('')
    setGender('')
    setProfilePicture(null)
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
          <Label htmlFor="gender">Gender</Label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="border dark:text-white dark:bg-neutral-800 border-input bg-transparent px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
            aria-placeholder="Select Gender"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            {/* <option value="other">Other</option> */}
          </select>
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="profilePicture">Profile Picture</Label>
          <Input
            id="profilePicture"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setProfilePicture(e.target.files[0])
              }
            }}
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
              {showPassword ? <Eye className="h-4 w-4 text-gray-500" onClick={() => setShowPassword(false)} /> : <EyeClosed className="h-4 w-4 text-gray-500" onClick={() => setShowPassword(true)} />}
            </div>
          </div>
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="confirm-password">Confirm your password</Label>
          <Input
            id="confirm-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              const val = e.target.value
              setConfirmPassword(val)
              setPasswordError(val !== password ? 'Passwords do not match' : null)
            }}
            type="password"
          />
          {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
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
