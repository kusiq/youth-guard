import cookieParser from 'cookie-parser'
import express from 'express'
import { z } from 'zod'
import type { AccountRole } from '../src/types'
import {
  SESSION_COOKIE_NAME,
  addCommentToNews,
  buildAppSnapshot,
  clearSession,
  createAppeal,
  createManagedUser,
  createSessionForUser,
  findUserByEmail,
  getDb,
  getUserForSessionToken,
  markAppealsSeen,
  publishNewsPost,
  toggleLikeForUser,
  updateAppealStatus,
  updateUserProfile,
  verifyUserPassword,
} from './database'

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const newsDraftSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(3),
  body: z.array(z.string().min(1)).min(1),
  category: z.string().min(1),
  image: z.string().optional(),
})

const commentSchema = z.object({
  text: z.string().min(1),
})

const appealDraftSchema = z.object({
  title: z.string().min(3),
  category: z.string().min(1),
  address: z.string().min(3),
  text: z.string().min(3),
  image: z.string().optional(),
})

const profileSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  city: z.string(),
  phone: z.string(),
  bio: z.string(),
  interests: z.array(z.string()),
  avatar: z.string().optional(),
})

const appealStatusSchema = z.object({
  status: z.enum(['Отправлено', 'Принято', 'В работе', 'Закрыто']),
})

const managedUserSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['user', 'admin']),
})

function setSessionCookie(response: express.Response, token: string) {
  response.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 14,
  })
}

function clearSessionCookie(response: express.Response) {
  response.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
  })
}

function requireAuth(request: express.Request, response: express.Response) {
  if (request.authUser === null) {
    response.status(401).send('Нужно войти в кабинет.')
    return false
  }

  return true
}

function requireAdmin(request: express.Request, response: express.Response) {
  if (request.authUser?.role !== 'admin') {
    response.status(403).send('Доступ только для администратора.')
    return false
  }

  return true
}

getDb()

const app = express()

app.use(cookieParser())
app.use(express.json({ limit: '12mb' }))
app.use((request, _response, next) => {
  const token = request.cookies[SESSION_COOKIE_NAME] as string | undefined
  request.authUser = getUserForSessionToken(token)
  next()
})

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/app/state', (request, response) => {
  response.json(buildAppSnapshot(request.authUser))
})

app.post('/api/auth/login', (request, response) => {
  const payload = signInSchema.parse(request.body)
  const user = findUserByEmail(payload.email)

  if (user === undefined || verifyUserPassword(user, payload.password) === false) {
    response.status(401).send('Неверный email или пароль.')
    return
  }

  const token = createSessionForUser(user.id)
  setSessionCookie(response, token)
  response.json(buildAppSnapshot(user))
})

app.post('/api/auth/register', (request, response) => {
  const payload = registerSchema.parse(request.body)
  const user = createManagedUser({
    email: payload.email,
    password: payload.password,
    displayName: payload.displayName,
    role: 'user',
  })
  const token = createSessionForUser(user.id)
  setSessionCookie(response, token)
  response.json(buildAppSnapshot(user))
})

app.post('/api/auth/logout', (request, response) => {
  const token = request.cookies[SESSION_COOKIE_NAME] as string | undefined
  clearSession(token)
  clearSessionCookie(response)
  response.json(buildAppSnapshot(null))
})

app.put('/api/profile', (request, response) => {
  if (requireAuth(request, response) === false) {
    return
  }

  const authUser = request.authUser

  if (authUser === null) {
    return
  }

  const payload = profileSchema.parse(request.body)
  updateUserProfile(authUser.id, payload)
  response.json(buildAppSnapshot(getUserForSessionToken(request.cookies[SESSION_COOKIE_NAME])))
})

app.post('/api/admin/news', (request, response) => {
  if (requireAdmin(request, response) === false) {
    return
  }

  const authUser = request.authUser

  if (authUser === null) {
    return
  }

  const payload = newsDraftSchema.parse(request.body)
  publishNewsPost(authUser, payload)
  response.json(buildAppSnapshot(authUser))
})

app.post('/api/news/:newsId/like', (request, response) => {
  if (requireAuth(request, response) === false) {
    return
  }

  const authUser = request.authUser

  if (authUser === null) {
    return
  }

  toggleLikeForUser(request.params.newsId, authUser.id)
  response.json(buildAppSnapshot(authUser))
})

app.post('/api/news/:newsId/comments', (request, response) => {
  if (requireAuth(request, response) === false) {
    return
  }

  const authUser = request.authUser

  if (authUser === null) {
    return
  }

  const payload = commentSchema.parse(request.body)
  addCommentToNews(request.params.newsId, authUser, payload.text)
  response.json(buildAppSnapshot(authUser))
})

app.post('/api/appeals', (request, response) => {
  if (requireAuth(request, response) === false) {
    return
  }

  const authUser = request.authUser

  if (authUser === null) {
    return
  }

  const payload = appealDraftSchema.parse(request.body)
  createAppeal(authUser, payload)
  response.json(buildAppSnapshot(authUser))
})

app.post('/api/admin/appeals/mark-seen', (request, response) => {
  if (requireAdmin(request, response) === false) {
    return
  }

  const authUser = request.authUser

  if (authUser === null) {
    return
  }

  markAppealsSeen()
  response.json(buildAppSnapshot(authUser))
})

app.patch('/api/admin/appeals/:appealId/status', (request, response) => {
  if (requireAdmin(request, response) === false) {
    return
  }

  const authUser = request.authUser

  if (authUser === null) {
    return
  }

  const payload = appealStatusSchema.parse(request.body)
  updateAppealStatus(request.params.appealId, payload.status)
  response.json(buildAppSnapshot(authUser))
})

app.post('/api/admin/users', (request, response) => {
  if (requireAdmin(request, response) === false) {
    return
  }

  const payload = managedUserSchema.parse(request.body)
  const user = createManagedUser({
    email: payload.email,
    password: payload.password,
    displayName: payload.displayName,
    role: payload.role as AccountRole,
  })

  response.status(201).json({
    created: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.display_name,
    },
  })
})

app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  void next

  if (error instanceof z.ZodError) {
    response.status(400).json({
      message: 'Некорректные данные запроса.',
      issues: error.issues,
    })
    return
  }

  const message = error instanceof Error ? error.message : 'Внутренняя ошибка сервера.'
  response.status(500).send(message)
})

const port = Number(process.env.API_PORT ?? 8787)

app.listen(port, () => {
  console.log(`Youth Guard API is running on http://127.0.0.1:${port}`)
})
