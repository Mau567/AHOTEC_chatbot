import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

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
        <Link href="/prototype" className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow">
          Test
        </Link>
        {children}
      </body>
    </html>
  )
} 