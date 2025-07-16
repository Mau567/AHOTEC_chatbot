'use client'

import { useLanguage } from '@/lib/LanguageContext'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
    >
      {language === 'es' ? 'EN' : 'ES'}
    </button>
  )
}
