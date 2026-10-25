import en from './locales/en'
import id from './locales/id'
import { useLocale } from '../hooks/useLocale'

export const DEFAULT_LOCALE = 'en'
export const SUPPORTED_LOCALES = ['en', 'id']

const DICTIONARIES = { en, id }

// Walks a dotted key ("tasks.groups.overdue") through a dictionary.
function resolve(dictionary, key) {
  return key
    .split('.')
    .reduce((value, part) => (value == null ? undefined : value[part]), dictionary)
}

// Looks up a translation key. Falls back to the default locale and finally to
// the key itself, so a missing translation never breaks the UI.
// Placeholders written as {name} are replaced with the values in `vars`.
export function translate(key, { locale = DEFAULT_LOCALE, vars } = {}) {
  const template =
    resolve(DICTIONARIES[locale], key) ?? resolve(DICTIONARIES[DEFAULT_LOCALE], key)

  if (typeof template !== 'string') return key
  if (!vars) return template

  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  )
}

// Translation accessor used by components. The active language comes from
// LocaleProvider, so switching it re-renders every consumer at once.
export function useTranslation() {
  const { locale, setLocale, t } = useLocale()
  return { locale, setLocale, t }
}
