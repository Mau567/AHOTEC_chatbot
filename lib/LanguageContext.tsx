'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'es' | 'en'

interface LanguageContextValue {
  language: Language
  toggleLanguage: () => void
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es')

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null
    if (stored) {
      setLanguage(stored)
    }
  }, [])

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'es' ? 'en' : 'es'
      localStorage.setItem('language', next)
      return next
    })
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
