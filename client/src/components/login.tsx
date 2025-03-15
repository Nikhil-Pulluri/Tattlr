'use client'
import React, { useState } from 'react'
import SignupFormDemo from './signup-form-demo'
import LoginFormDemo from './Login-form'
import RotatingText from '../../TextAnimations/RotatingText/RotatingText'

export default function Login() {
  const [login, setLogin] = useState(true)

  return (
    <div className="min-h-screen flex bg-[#4267B2]">
      <div className="flex flex-col justify-center items-center w-full sm:w-1/2 bg-[#4267B2] text-white p-6">
        <div className="text-6xl font-bold mb-4">With Tattlr,</div>

        <div className="flex justify-center items-center space-x-2 text-4xl font-semibold">
          <span className="text-6xl font-bold transition-transform duration-1000 ease-in-out">More</span>
          <div className="flex justify-center items-center">
            <RotatingText
              texts={['Security', 'Control', 'Privacy', 'Freedom']}
              mainClassName="bg-gray-700 text-6xl text-white py-2 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-lg transition-transform duration-1000 ease-in-out"
              staggerFrom="first"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-120%', opacity: 0 }}
              staggerDuration={0.05}
              splitLevelClassName="overflow-hidden"
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              rotationInterval={2500}
              loop={true}
              auto={true}
            />
          </div>
        </div>
      </div>

      {/* Right side: Login/Signup Form */}
      <div className="w-full sm:w-1/2 bg-transparent flex justify-center items-center py-10 px-6">
        <div className="flex flex-col w-full max-w-md bg-white dark:bg-black p-8 rounded-2xl shadow-lg">
          <div>{login ? <LoginFormDemo /> : <SignupFormDemo />}</div>
          <div className="text-center cursor-pointer text-neutral-700 dark:text-neutral-300 font-medium mt-6" onClick={() => setLogin(!login)}>
            {login ? <div>New User?</div> : <div>Already a user?</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
