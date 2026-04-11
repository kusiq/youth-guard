export type ThemeMode = 'light' | 'dark'
export type Role = 'guest' | 'user' | 'admin'
export type AccountRole = Exclude<Role, 'guest'>
export type AppealStatus = 'Отправлено' | 'Принято' | 'В работе' | 'Закрыто'

export interface NewsComment {
  id: string
  author: string
  role: AccountRole
  text: string
  createdAt: string
  avatar?: string
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  body: string[]
  category: string
  createdAt: string
  author: string
  image?: string
  likes: number
  viewerHasLiked: boolean
  comments: NewsComment[]
}

export interface Appeal {
  id: string
  title: string
  category: string
  address: string
  text: string
  createdAt: string
  status: AppealStatus
  authorName: string
  viewedByAdmin: boolean
  image?: string
}

export interface UserProfile {
  displayName: string
  email: string
  city: string
  phone: string
  bio: string
  interests: string[]
  avatar?: string
}

export interface Session {
  role: Role
  displayName: string
  email: string
  avatar?: string
}

export interface SignInPayload {
  email: string
  password: string
  role: AccountRole
  displayName?: string
}

export interface RegisterPayload {
  displayName: string
  email: string
  password: string
}

export interface NewsDraft {
  title: string
  summary: string
  body: string[]
  category: string
  image?: string
}

export interface AppealDraft {
  title: string
  category: string
  address: string
  text: string
  image?: string
}
