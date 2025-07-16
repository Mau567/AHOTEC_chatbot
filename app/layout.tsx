import './globals.css'
import type { Metadata } from 'next'
import LanguageProviderClient from './LanguageProviderClient'

export const metadata: Metadata = {
  title: 'AHOTECT Hotel Chatbot',
  description: 'Hotel submission form and chatbot interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <LanguageProviderClient>{children}</LanguageProviderClient>
      </body>
    </html>
  )
}