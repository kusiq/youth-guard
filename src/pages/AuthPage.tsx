import LoginRounded from '@mui/icons-material/LoginRounded'
import PersonAddRounded from '@mui/icons-material/PersonAddRounded'
import SwapHorizRounded from '@mui/icons-material/SwapHorizRounded'
import {
  Button,
  Container,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useState, useTransition } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export function AuthPage() {
  const { isAuthenticated, session, signIn, register, signOut } = useAppState()
  const [viewMode, setViewMode] = useState<'login' | 'register'>('login')
  const [isPending, startTransition] = useTransition()
  const [signInForm, setSignInForm] = useState({
    email: 'admin@kostroma-demo.ru',
    password: 'demo-password',
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

  if (isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 2.5 } }}>
        <Paper sx={{ px: { xs: 2.25, md: 2.75 }, py: { xs: 2.25, md: 2.75 } }}>
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary">
              Активная сессия
            </Typography>
            <Typography variant="h2">Сессия активна.</Typography>
            <Typography variant="body1" color="text.secondary">
              Можно сразу перейти в нужный раздел без повторного входа и лишнего промежуточного экрана.
            </Typography>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Текущая сессия
                </Typography>
                <Typography variant="h3">{session.displayName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {session.email || 'Демо-режим без привязки к почте'}
                </Typography>
              </Stack>
            </Paper>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                component={RouterLink}
                to={session.role === 'admin' ? '/admin' : '/profile'}
                variant="contained"
              >
                {session.role === 'admin' ? 'Открыть админку' : 'Открыть профиль'}
              </Button>
              <Button variant="outlined" color="secondary" startIcon={<SwapHorizRounded />} onClick={signOut}>
                Сменить роль
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Stack spacing={1.6}>
        <Stack spacing={0.75}>
          <Typography variant="overline" color="text.secondary">
            Вход и регистрация
          </Typography>
          <Typography variant="h2">Кабинет без лишних экранов.</Typography>
          <Typography variant="body1" color="text.secondary">
            Пользователь попадает в профиль и обращения, а администратор — сразу в рабочую админку.
          </Typography>
        </Stack>

        <Paper
          sx={{
            px: { xs: 2.25, md: 2.75 },
            pb: { xs: 2.25, md: 2.75 },
            pt: { xs: 1.25, md: 1.5 },
          }}
        >
          <Stack spacing={1.6}>
            <Tabs
              value={viewMode}
              onChange={(_event, value) => setViewMode(value)}
              variant="fullWidth"
              sx={{ mb: 0 }}
            >
              <Tab icon={<LoginRounded />} iconPosition="start" label="Войти" value="login" />
              <Tab icon={<PersonAddRounded />} iconPosition="start" label="Регистрация" value="register" />
            </Tabs>

            {viewMode === 'login' ? (
              <Stack component="form" spacing={1.5} onSubmit={handleSignInSubmit} sx={{ pt: 0.25 }}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={signInForm.email}
                  onChange={(event) =>
                    setSignInForm((currentForm) => ({
                      ...currentForm,
                      email: event.target.value,
                    }))
                  }
                />
                <TextField
                  label="Пароль"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={signInForm.password}
                  onChange={(event) =>
                    setSignInForm((currentForm) => ({
                      ...currentForm,
                      password: event.target.value,
                    }))
                  }
                />
                <Button type="submit" variant="contained" disabled={isPending}>
                  {isPending ? 'Открываем кабинет...' : 'Войти'}
                </Button>
              </Stack>
            ) : (
              <Stack component="form" spacing={1.5} onSubmit={handleRegisterSubmit} sx={{ pt: 0.25 }}>
                <TextField
                  label="Имя"
                  name="displayName"
                  autoComplete="name"
                  value={registerForm.displayName}
                  onChange={(event) =>
                    setRegisterForm((currentForm) => ({
                      ...currentForm,
                      displayName: event.target.value,
                    }))
                  }
                />
                <TextField
                  label="Email"
                  name="registerEmail"
                  type="email"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm((currentForm) => ({
                      ...currentForm,
                      email: event.target.value,
                    }))
                  }
                />
                <TextField
                  label="Пароль"
                  name="registerPassword"
                  type="password"
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm((currentForm) => ({
                      ...currentForm,
                      password: event.target.value,
                    }))
                  }
                />
                <Button type="submit" variant="contained" disabled={isPending}>
                  {isPending ? 'Создаем профиль...' : 'Создать кабинет'}
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
