'use client'
import { useLanguage } from '@/context/LanguageContext'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  return (
    <button onClick={toggleLanguage} className="px-2 py-1 text-sm border rounded">
      {language === 'es' ? 'EN' : 'ES'}
    </button>
  )
}
