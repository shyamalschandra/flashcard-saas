import { ReactNode } from 'react'
import { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'SaaS Flashcard App',
  description: 'A flashcard application for efficient learning',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  )
}