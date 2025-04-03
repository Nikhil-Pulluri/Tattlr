import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/jwtContext'
import { SocketProvider } from '@/context/socketContext'
import { ThemeProvider } from '@/context/themeProvider'
import { UserDataProvider } from '@/context/userDataContext'
import { ChatListProvider } from '@/context/chatListContext'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tattlr',
  description: 'A real-time chat application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SocketProvider>
              <UserDataProvider>
                <ChatListProvider>{children}</ChatListProvider>
              </UserDataProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
