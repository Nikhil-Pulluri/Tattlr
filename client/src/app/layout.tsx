import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/context/jwtContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tattlr',
  description: 'Connect with people',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={``}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
