/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode is driven by the "dark" class on the <html> element.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Material 3 (M3) semantic colors mapped to CSS variables so the
      // active light/dark palette can be swapped by toggling a single class.
      colors: {
        primary: 'rgb(var(--md-primary) / <alpha-value>)',
        'on-primary': 'rgb(var(--md-on-primary) / <alpha-value>)',
        'primary-container': 'rgb(var(--md-primary-container) / <alpha-value>)',
        'on-primary-container': 'rgb(var(--md-on-primary-container) / <alpha-value>)',
        secondary: 'rgb(var(--md-secondary) / <alpha-value>)',
        'on-secondary': 'rgb(var(--md-on-secondary) / <alpha-value>)',
        'secondary-container': 'rgb(var(--md-secondary-container) / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--md-on-secondary-container) / <alpha-value>)',
        tertiary: 'rgb(var(--md-tertiary) / <alpha-value>)',
        surface: 'rgb(var(--md-surface) / <alpha-value>)',
        'surface-variant': 'rgb(var(--md-surface-variant) / <alpha-value>)',
        'on-surface': 'rgb(var(--md-on-surface) / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--md-on-surface-variant) / <alpha-value>)',
        outline: 'rgb(var(--md-outline) / <alpha-value>)',
        'outline-variant': 'rgb(var(--md-outline-variant) / <alpha-value>)',
        error: 'rgb(var(--md-error) / <alpha-value>)',
        'error-container': 'rgb(var(--md-error-container) / <alpha-value>)',
        'on-error': 'rgb(var(--md-on-error) / <alpha-value>)',
        'on-error-container': 'rgb(var(--md-on-error-container) / <alpha-value>)',
      },
      borderRadius: {
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '28px',
      },
      boxShadow: {
        // M3 elevation levels.
        'm3-1': '0 1px 2px 0 rgb(0 0 0 / 0.30), 0 1px 3px 1px rgb(0 0 0 / 0.15)',
        'm3-2': '0 1px 2px 0 rgb(0 0 0 / 0.30), 0 2px 6px 2px rgb(0 0 0 / 0.15)',
        'm3-3': '0 4px 8px 3px rgb(0 0 0 / 0.15), 0 1px 3px 0 rgb(0 0 0 / 0.30)',
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
