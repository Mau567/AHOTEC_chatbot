import './globals.css'
import type { Metadata } from 'next'
import { LanguageProvider, useLanguage } from '@/context/LanguageContext'

export const metadata: Metadata = {
  title: 'AHOTECT Hotel Chatbot',
  description: 'Hotel submission form and chatbot interface',
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()
  return (
    <html lang={language}>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LayoutInner>{children}</LayoutInner>
    </LanguageProvider>
  )
}