import { useAppState } from '../state/AppState'

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppState()
  const nextThemeLabel = theme === 'light' ? 'Темная тема' : 'Светлая тема'

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={nextThemeLabel}
    >
      <span className="theme-toggle__dot" aria-hidden="true" />
      <span className="theme-toggle__label">{nextThemeLabel}</span>
    </button>
  )
}
