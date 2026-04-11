import { hashSync, compareSync } from 'bcryptjs'
import Database from 'better-sqlite3'
import { randomUUID, createHash } from 'node:crypto'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type {
  AccountRole,
  Appeal,
  AppealDraft,
  AppealStatus,
  AppSnapshot,
  NewsComment,
  NewsDraft,
  NewsItem,
  Session,
  UserProfile,
} from '../src/types'
import { seedAppeals, seedNews, seedUsers } from './seedData'

type DatabaseClient = Database.Database

interface UserRow {
  id: string
  email: string
  password_hash: string
  role: AccountRole
  display_name: string
  avatar: string | null
  city: string
  phone: string
  bio: string
  interests_json: string
}

interface NewsPostRow {
  id: string
  title: string
  summary: string
  body_json: string
  category: string
  created_at: string
  author_name: string
  image: string | null
  likes_count: number
}

interface NewsCommentRow {
  id: string
  author_name: string
  role: AccountRole
  text: string
  created_at: string
  avatar: string | null
}

interface AppealRow {
  id: string
  title: string
  category: string
  address: string
  text: string
  created_at: string
  status: AppealStatus
  author_name: string
  viewed_by_admin: number
  image: string | null
}

const DB_PATH = resolve(process.cwd(), 'data', 'youth-guard.db')
export const SESSION_COOKIE_NAME = 'yg_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14

let database: DatabaseClient | null = null

function nowIso() {
  return new Date().toISOString()
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function parseInterests(interestsJson: string) {
  try {
    return JSON.parse(interestsJson) as string[]
  } catch {
    return []
  }
}

function guestSession(): Session {
  return {
    role: 'guest',
    displayName: 'Гость',
    email: '',
  }
}

function guestProfile(): UserProfile {
  return {
    displayName: 'Гость',
    email: '',
    city: 'Кострома',
    phone: '',
    bio: '',
    interests: [],
  }
}

function toProfile(user: UserRow): UserProfile {
  return {
    displayName: user.display_name,
    email: user.email,
    city: user.city,
    phone: user.phone,
    bio: user.bio,
    interests: parseInterests(user.interests_json),
    avatar: user.avatar ?? undefined,
  }
}

function toSession(user: UserRow): Session {
  return {
    role: user.role,
    displayName: user.display_name,
    email: user.email,
    avatar: user.avatar ?? undefined,
  }
}

function createSchema(db: DatabaseClient) {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
      display_name TEXT NOT NULL,
      avatar TEXT,
      city TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      interests_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news_posts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      body_json TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT NOT NULL,
      author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      image TEXT,
      likes_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS news_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES news_posts(id) ON DELETE CASCADE,
      author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'admin')),
      text TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news_likes (
      post_id TEXT NOT NULL REFERENCES news_posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS appeals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      address TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Отправлено', 'Принято', 'В работе', 'Закрыто')),
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      viewed_by_admin INTEGER NOT NULL DEFAULT 0,
      image TEXT
    );
  `)
}

function seedDatabase(db: DatabaseClient) {
  const existingUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }

  if (existingUsers.count > 0) {
    return
  }

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, email, password_hash, role, display_name, avatar, city, phone, bio, interests_json, created_at
    ) VALUES (
      @id, @email, @passwordHash, @role, @displayName, @avatar, @city, @phone, @bio, @interestsJson, @createdAt
    )
  `)

  const insertNews = db.prepare(`
    INSERT INTO news_posts (
      id, title, summary, body_json, category, created_at, author_name, image, likes_count
    ) VALUES (
      @id, @title, @summary, @bodyJson, @category, @createdAt, @authorName, @image, @likes
    )
  `)

  const insertComment = db.prepare(`
    INSERT INTO news_comments (
      id, post_id, author_id, author_name, role, text, avatar, created_at
    ) VALUES (
      @id, @postId, @authorId, @authorName, @role, @text, @avatar, @createdAt
    )
  `)

  const insertAppeal = db.prepare(`
    INSERT INTO appeals (
      id, title, category, address, text, created_at, status, author_id, author_name, viewed_by_admin, image
    ) VALUES (
      @id, @title, @category, @address, @text, @createdAt, @status, @authorId, @authorName, @viewedByAdmin, @image
    )
  `)

  const seed = db.transaction(() => {
    for (const user of seedUsers) {
      insertUser.run({
        id: user.id,
        email: user.email,
        passwordHash: hashSync(user.password, 10),
        role: user.role,
        displayName: user.displayName,
        avatar: user.avatar ?? null,
        city: user.city,
        phone: user.phone,
        bio: user.bio,
        interestsJson: JSON.stringify(user.interests),
        createdAt: nowIso(),
      })
    }

    for (const post of seedNews) {
      insertNews.run({
        id: post.id,
        title: post.title,
        summary: post.summary,
        bodyJson: JSON.stringify(post.body),
        category: post.category,
        createdAt: post.createdAt,
        authorName: post.authorName,
        image: post.image ?? null,
        likes: post.likes,
      })

      for (const comment of post.comments) {
        const authorId = comment.authorEmail
          ? ((db.prepare('SELECT id FROM users WHERE email = ?').get(comment.authorEmail) as { id: string } | undefined)?.id ?? null)
          : null

        insertComment.run({
          id: comment.id,
          postId: post.id,
          authorId,
          authorName: comment.authorName,
          role: comment.role,
          text: comment.text,
          avatar: comment.avatar ?? null,
          createdAt: comment.createdAt,
        })
      }
    }

    for (const appeal of seedAppeals) {
      const author = db.prepare('SELECT id, display_name FROM users WHERE email = ?').get(appeal.authorEmail) as { id: string; display_name: string }

      insertAppeal.run({
        id: appeal.id,
        title: appeal.title,
        category: appeal.category,
        address: appeal.address,
        text: appeal.text,
        createdAt: appeal.createdAt,
        status: appeal.status,
        authorId: author.id,
        authorName: author.display_name,
        viewedByAdmin: appeal.viewedByAdmin ? 1 : 0,
        image: appeal.image ?? null,
      })
    }
  })

  seed()
}

export function getDb() {
  if (database !== null) {
    return database
  }

  mkdirSync(dirname(DB_PATH), { recursive: true })
  const db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  createSchema(db)
  seedDatabase(db)
  database = db
  return db
}

export function findUserByEmail(email: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as UserRow | undefined
}

export function createManagedUser({
  email,
  password,
  displayName,
  role,
}: {
  email: string
  password: string
  displayName: string
  role: AccountRole
}) {
  const db = getDb()
  const normalizedEmail = email.trim().toLowerCase()

  if (findUserByEmail(normalizedEmail) !== undefined) {
    throw new Error('Пользователь с таким email уже существует.')
  }

  const userId = `user-${randomUUID().slice(0, 8)}`
  db.prepare(`
    INSERT INTO users (
      id, email, password_hash, role, display_name, city, phone, bio, interests_json, created_at
    ) VALUES (
      ?, ?, ?, ?, ?, '', '', '', '[]', ?
    )
  `).run(
    userId,
    normalizedEmail,
    hashSync(password, 10),
    role,
    displayName.trim(),
    nowIso(),
  )

  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow
}

export function verifyUserPassword(user: UserRow, password: string) {
  return compareSync(password, user.password_hash)
}

export function createSessionForUser(userId: string) {
  const db = getDb()
  const rawToken = `${randomUUID()}${randomUUID()}`.replace(/-/g, '')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  db.prepare(`
    INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    `session-${randomUUID().slice(0, 8)}`,
    userId,
    hashToken(rawToken),
    nowIso(),
    expiresAt,
  )

  return rawToken
}

export function clearSession(rawToken?: string) {
  if (rawToken === undefined || rawToken === '') {
    return
  }

  const db = getDb()
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(rawToken))
}

export function getUserForSessionToken(rawToken?: string) {
  if (rawToken === undefined || rawToken === '') {
    return null
  }

  const db = getDb()
  const row = db.prepare(`
    SELECT users.*
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(hashToken(rawToken), nowIso()) as UserRow | undefined

  if (row === undefined) {
    clearSession(rawToken)
    return null
  }

  return row
}

function buildNewsSnapshot(viewerId?: string) {
  const db = getDb()
  const posts = db.prepare(`
    SELECT id, title, summary, body_json, category, created_at, author_name, image, likes_count
    FROM news_posts
    ORDER BY created_at DESC
  `).all() as NewsPostRow[]

  const likedPostIds = new Set<string>()

  if (viewerId !== undefined) {
    const rows = db.prepare('SELECT post_id FROM news_likes WHERE user_id = ?').all(viewerId) as Array<{ post_id: string }>
    for (const row of rows) {
      likedPostIds.add(row.post_id)
    }
  }

  const commentsStatement = db.prepare(`
    SELECT id, author_name, role, text, created_at, avatar
    FROM news_comments
    WHERE post_id = ?
    ORDER BY created_at ASC
  `)

  return posts.map((post) => {
    const comments = commentsStatement.all(post.id) as NewsCommentRow[]

    return {
      id: post.id,
      title: post.title,
      summary: post.summary,
      body: JSON.parse(post.body_json) as string[],
      category: post.category,
      createdAt: post.created_at,
      author: post.author_name,
      image: post.image ?? undefined,
      likes: post.likes_count,
      viewerHasLiked: likedPostIds.has(post.id),
      comments: comments.map<NewsComment>((comment) => ({
        id: comment.id,
        author: comment.author_name,
        role: comment.role,
        text: comment.text,
        createdAt: comment.created_at,
        avatar: comment.avatar ?? undefined,
      })),
    } satisfies NewsItem
  })
}

function buildAppealsSnapshot(user: UserRow | null) {
  if (user === null) {
    return []
  }

  const db = getDb()
  const appeals = user.role === 'admin'
    ? db.prepare(`
        SELECT id, title, category, address, text, created_at, status, author_name, viewed_by_admin, image
        FROM appeals
        ORDER BY created_at DESC
      `).all()
    : db.prepare(`
        SELECT id, title, category, address, text, created_at, status, author_name, viewed_by_admin, image
        FROM appeals
        WHERE author_id = ?
        ORDER BY created_at DESC
      `).all(user.id)

  return (appeals as AppealRow[]).map<Appeal>((appeal) => ({
    id: appeal.id,
    title: appeal.title,
    category: appeal.category,
    address: appeal.address,
    text: appeal.text,
    createdAt: appeal.created_at,
    status: appeal.status,
    authorName: appeal.author_name,
    viewedByAdmin: Boolean(appeal.viewed_by_admin),
    image: appeal.image ?? undefined,
  }))
}

export function buildAppSnapshot(user: UserRow | null): AppSnapshot {
  const appeals = buildAppealsSnapshot(user)
  const unreadAppealCount = user?.role === 'admin'
    ? appeals.filter((appeal) => appeal.viewedByAdmin === false).length
    : 0

  return {
    session: user === null ? guestSession() : toSession(user),
    profile: user === null ? guestProfile() : toProfile(user),
    news: buildNewsSnapshot(user?.id),
    appeals,
    unreadAppealCount,
  }
}

export function updateUserProfile(userId: string, profile: UserProfile) {
  const db = getDb()
  db.prepare(`
    UPDATE users
    SET display_name = ?, email = ?, city = ?, phone = ?, bio = ?, interests_json = ?, avatar = ?
    WHERE id = ?
  `).run(
    profile.displayName.trim(),
    profile.email.trim().toLowerCase(),
    profile.city.trim(),
    profile.phone.trim(),
    profile.bio.trim(),
    JSON.stringify(profile.interests),
    profile.avatar ?? null,
    userId,
  )
}

export function publishNewsPost(user: UserRow, draft: NewsDraft) {
  const db = getDb()
  db.prepare(`
    INSERT INTO news_posts (
      id, title, summary, body_json, category, created_at, author_id, author_name, image, likes_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).run(
    `news-${randomUUID().slice(0, 8)}`,
    draft.title.trim(),
    draft.summary.trim(),
    JSON.stringify(draft.body),
    draft.category,
    nowIso(),
    user.id,
    user.display_name,
    draft.image ?? null,
  )
}

export function toggleLikeForUser(newsId: string, userId: string) {
  const db = getDb()
  const toggle = db.transaction(() => {
    const existing = db.prepare(
      'SELECT 1 FROM news_likes WHERE post_id = ? AND user_id = ?',
    ).get(newsId, userId)

    if (existing === undefined) {
      db.prepare(`
        INSERT INTO news_likes (post_id, user_id, created_at)
        VALUES (?, ?, ?)
      `).run(newsId, userId, nowIso())
      db.prepare('UPDATE news_posts SET likes_count = likes_count + 1 WHERE id = ?').run(newsId)
      return
    }

    db.prepare('DELETE FROM news_likes WHERE post_id = ? AND user_id = ?').run(newsId, userId)
    db.prepare(`
      UPDATE news_posts
      SET likes_count = CASE WHEN likes_count > 0 THEN likes_count - 1 ELSE 0 END
      WHERE id = ?
    `).run(newsId)
  })

  toggle()
}

export function addCommentToNews(newsId: string, user: UserRow, text: string) {
  const db = getDb()
  db.prepare(`
    INSERT INTO news_comments (
      id, post_id, author_id, author_name, role, text, avatar, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `comment-${randomUUID().slice(0, 8)}`,
    newsId,
    user.id,
    user.display_name,
    user.role,
    text.trim(),
    user.avatar,
    nowIso(),
  )
}

export function createAppeal(user: UserRow, draft: AppealDraft) {
  const db = getDb()
  db.prepare(`
    INSERT INTO appeals (
      id, title, category, address, text, created_at, status, author_id, author_name, viewed_by_admin, image
    ) VALUES (?, ?, ?, ?, ?, ?, 'Отправлено', ?, ?, 0, ?)
  `).run(
    `appeal-${randomUUID().slice(0, 8)}`,
    draft.title.trim(),
    draft.category,
    draft.address.trim(),
    draft.text.trim(),
    nowIso(),
    user.id,
    user.display_name,
    draft.image ?? null,
  )
}

export function markAppealsSeen() {
  const db = getDb()
  db.prepare('UPDATE appeals SET viewed_by_admin = 1 WHERE viewed_by_admin = 0').run()
}

export function updateAppealStatus(appealId: string, status: AppealStatus) {
  const db = getDb()
  db.prepare(`
    UPDATE appeals
    SET status = ?, viewed_by_admin = 1
    WHERE id = ?
  `).run(status, appealId)
}
