import { useContext } from 'react'
import { LocaleContext } from '../context/localeContext'

// Convenience hook to access the language context.
export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}
