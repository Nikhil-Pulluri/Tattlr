import type { Metadata } from 'next'
// import { Geist, Geist_Mono } from 'next/font/google'
import { AuthProvider } from '@/context/jwtContext'
import { ThemeProvider } from '@/context/themeProvider'
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
    <html lang="en" suppressHydrationWarning>
      <body className={``}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
