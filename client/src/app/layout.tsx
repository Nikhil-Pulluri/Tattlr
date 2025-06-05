import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import '@radix-ui/themes/styles.css'
// import { UserProvider } from '@/context/userContext'

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tattlr',
  description: 'Real Time Messaging',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${jetBrainsMono.className} dark antialiased`}>
        {/* <UserProvider>{children}</UserProvider> */}
        {children}
      </body>
    </html>
  )
}
