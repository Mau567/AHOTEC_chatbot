'use client'
import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()
  const t = useTranslation()

  return (
    <button
      onClick={toggleLanguage}
      className="px-2 py-1 text-sm border rounded"
    >
      {t('toggle_label')}
    </button>
  )
}
