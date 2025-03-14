'use client'
import React from 'react'
import SignupFormDemo from './signup-form-demo'

export default function Login() {
  return (
    <div className="min-h-screen flex justify-center">
      <div className="bg-amber-400 w-1/2"></div>
      <div className="bg-transparent w-1/2 flex justify-center items-center">
        <div className="flex flex-col space-y-4">
          <div className="">
            <SignupFormDemo />
          </div>
        </div>
      </div>
    </div>
  )
}
