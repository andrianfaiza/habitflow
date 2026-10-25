import { useCallback, useEffect, useMemo, useState } from 'react'
import { LocaleContext } from './localeContext'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, translate } from '../i18n'

const STORAGE_KEY = 'habitflow.locale'

// Resolves the initial language. English is always the default, even when the
// browser is configured for another language.
function getInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return SUPPORTED_LOCALES.includes(stored) ? stored : DEFAULT_LOCALE
}

// Exposes the active language and keeps <html lang>, the document title and
// localStorage in sync.
export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale)

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.title = translate('app.title', { locale })
  }, [locale])

  const setLocale = useCallback((next) => {
    if (SUPPORTED_LOCALES.includes(next)) setLocaleState(next)
  }, [])

  const t = useCallback((key, vars) => translate(key, { locale, vars }), [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
