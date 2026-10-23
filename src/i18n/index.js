import en from './locales/en'

export const DEFAULT_LOCALE = 'en'

const DICTIONARIES = { en }

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

// Translation accessor used by components.
export function useTranslation() {
  return {
    locale: DEFAULT_LOCALE,
    t: (key, vars) => translate(key, { locale: DEFAULT_LOCALE, vars }),
  }
}
