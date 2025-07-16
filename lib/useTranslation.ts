import { translations, TranslationKey } from './translations'
import { useLanguage } from '@/contexts/LanguageContext'

export function useTranslation() {
  const { language } = useLanguage()
  return (key: TranslationKey): string => {
    return translations[language][key] || key
  }
}
