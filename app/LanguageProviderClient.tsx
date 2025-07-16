'use client'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { useEffect } from 'react'

function Inner({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])
  return <>{children}</>
}

export default function LanguageProviderClient({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Inner>{children}</Inner>
    </LanguageProvider>
  )
}
