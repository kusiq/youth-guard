import { useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import type { AccountRole } from '../types'

export function AuthPage() {
  const { isAuthenticated, session, signIn, register, signOut } = useAppState()
  const [viewMode, setViewMode] = useState<'login' | 'register'>('login')
  const [isPending, startTransition] = useTransition()
  const [signInForm, setSignInForm] = useState({
    email: 'admin@kostroma-demo.ru',
    password: 'demo-password',
    role: 'admin' as AccountRole,
  })
  const [registerForm, setRegisterForm] = useState({
    displayName: 'Новый участник',
    email: 'user@kostroma-demo.ru',
    password: 'demo-password',
  })

  function handleSignInSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      signIn(signInForm)
    })
  }

  function handleRegisterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      register(registerForm)
      setViewMode('login')
    })
  }

  return (
    <section className="page-shell">
      <div className="content-shell auth-grid">
        <div>
          <p className="eyebrow">Вход и регистрация</p>
          <h1>Один вход, две роли, понятная логика доступа.</h1>
          <p className="lead">
            Пользователь получает профиль, обращения и историю активности. Администратор
            видит входящие обращения, уведомления и публикацию новостей.
          </p>

          <ul className="workflow-list workflow-list--compact">
            <li>В демонстрации можно переключаться между ролями прямо из формы входа.</li>
            <li>Регистрация создает обычного пользователя с базовым профилем.</li>
            <li>Дальше этот слой легко заменить реальной авторизацией и бэкендом.</li>
          </ul>
        </div>

        <div className="auth-panel">
          <div className="auth-tabs" role="tablist" aria-label="Выбор сценария входа">
            <button
              className={viewMode === 'login' ? 'auth-tabs__button is-active' : 'auth-tabs__button'}
              type="button"
              onClick={() => setViewMode('login')}
            >
              Войти
            </button>
            <button
              className={viewMode === 'register' ? 'auth-tabs__button is-active' : 'auth-tabs__button'}
              type="button"
              onClick={() => setViewMode('register')}
            >
              Регистрация
            </button>
          </div>

          {isAuthenticated ? (
            <section className="summary-panel">
              <p className="meta-line">Активная сессия</p>
              <h3>{session.displayName}</h3>
              <p>{session.email || 'Демо-режим без реального email'}</p>
              <div className="button-row">
                <Link className="button button--primary" to="/profile">
                  Открыть профиль
                </Link>
                {session.role === 'admin' ? (
                  <Link className="button button--secondary" to="/admin">
                    Перейти в админку
                  </Link>
                ) : null}
                <button className="button button--ghost" type="button" onClick={signOut}>
                  Сменить роль
                </button>
              </div>
            </section>
          ) : null}

          {viewMode === 'login' ? (
            <form className="form-stack" onSubmit={handleSignInSubmit}>
              <label className="field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={signInForm.email}
                  onChange={(event) =>
                    setSignInForm((currentForm) => ({
                      ...currentForm,
                      email: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Пароль</span>
                <input
                  className="input"
                  type="password"
                  value={signInForm.password}
                  onChange={(event) =>
                    setSignInForm((currentForm) => ({
                      ...currentForm,
                      password: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Роль для демо</span>
                <select
                  className="select"
                  value={signInForm.role}
                  onChange={(event) =>
                    setSignInForm((currentForm) => ({
                      ...currentForm,
                      role: event.target.value as AccountRole,
                    }))
                  }
                >
                  <option value="user">Обычный пользователь</option>
                  <option value="admin">Администратор</option>
                </select>
              </label>

              <button className="button button--primary" type="submit" disabled={isPending}>
                {isPending ? 'Открываем кабинет...' : 'Войти'}
              </button>
            </form>
          ) : (
            <form className="form-stack" onSubmit={handleRegisterSubmit}>
              <label className="field">
                <span>Имя</span>
                <input
                  className="input"
                  type="text"
                  value={registerForm.displayName}
                  onChange={(event) =>
                    setRegisterForm((currentForm) => ({
                      ...currentForm,
                      displayName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  className="input"
                  type="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((currentForm) => ({
                      ...currentForm,
                      email: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Пароль</span>
                <input
                  className="input"
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((currentForm) => ({
                      ...currentForm,
                      password: event.target.value,
                    }))
                  }
                />
              </label>

              <button className="button button--primary" type="submit" disabled={isPending}>
                {isPending ? 'Создаем профиль...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
