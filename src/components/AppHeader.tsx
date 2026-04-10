import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { roleLabels } from '../data/mockData'
import { useAppState } from '../state/AppState'
import { NotificationBadge } from './NotificationBadge'
import { ThemeToggle } from './ThemeToggle'

const primaryLinks = [
  { to: '/', label: 'Главная' },
  { to: '/news', label: 'Новости' },
  { to: '/appeal/new', label: 'Обращение' },
]

function getLinkClassName(isActive: boolean) {
  return isActive ? 'site-nav__link is-active' : 'site-nav__link'
}

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, session, signOut, unreadAppealCount } = useAppState()
  const menuLabel = isMenuOpen ? 'Закрыть навигацию' : 'Открыть навигацию'

  const panelClassName = isMenuOpen
    ? 'site-header__panel is-open'
    : 'site-header__panel'

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="site-header">
      <div className="content-shell site-header__inner">
        <Link className="site-brand" to="/" onClick={closeMenu}>
          <span className="site-brand__mark">МК</span>
          <span className="site-brand__text">
            <strong>Молодая Гвардия</strong>
            <span>Кострома</span>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="site-header-panel"
          aria-label={menuLabel}
          onClick={() =>
            setIsMenuOpen((currentValue) =>
              currentValue ? false : true,
            )
          }
        >
          <span />
          <span />
          <span />
        </button>

        <div className={panelClassName} id="site-header-panel">
          <nav className="site-nav" aria-label="Основная навигация">
            {primaryLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => getLinkClassName(isActive)}
                onClick={closeMenu}
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <NavLink
                to="/profile"
                className={({ isActive }) => getLinkClassName(isActive)}
                onClick={closeMenu}
              >
                Профиль
              </NavLink>
            ) : null}

            {session.role === 'admin' ? (
              <NavLink
                to="/admin"
                className={({ isActive }) => getLinkClassName(isActive)}
                onClick={closeMenu}
              >
                <span>Админка</span>
                <NotificationBadge value={unreadAppealCount} />
              </NavLink>
            ) : null}
          </nav>

          <div className="site-header__actions">
            <span className="role-pill">{roleLabels[session.role]}</span>
            <ThemeToggle />

            {isAuthenticated ? (
              <button
                className="button button--ghost"
                type="button"
                onClick={() => {
                  closeMenu()
                  signOut()
                }}
              >
                Выйти
              </button>
            ) : (
              <Link className="button button--ghost" to="/auth" onClick={closeMenu}>
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
