/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  defaultProfile,
  initialAppeals,
  initialNews,
  initialSession,
} from '../data/mockData'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type {
  Appeal,
  AppealDraft,
  AppealStatus,
  NewsComment,
  NewsDraft,
  NewsItem,
  RegisterPayload,
  Session,
  SignInPayload,
  ThemeMode,
  UserProfile,
} from '../types'

interface AppStateValue {
  theme: ThemeMode
  session: Session
  profile: UserProfile
  news: NewsItem[]
  appeals: Appeal[]
  unreadAppealCount: number
  isAuthenticated: boolean
  toggleTheme: () => void
  signIn: (payload: SignInPayload) => void
  register: (payload: RegisterPayload) => void
  signOut: () => void
  publishNews: (draft: NewsDraft) => void
  addComment: (newsId: string, text: string) => void
  createAppeal: (draft: AppealDraft) => void
  updateProfile: (draft: UserProfile) => void
  markAppealsSeen: () => void
  updateAppealStatus: (appealId: string, nextStatus: AppealStatus) => void
}

const AppStateContext = createContext<AppStateValue | null>(null)

function createId(prefix: string) {
  const randomId =
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)

  return `${prefix}-${randomId.slice(0, 8)}`
}

function buildDisplayName(email: string) {
  const [name] = email.split('@')

  if (name === undefined || name === '') {
    return 'Участник'
  }

  return name
    .split(/[._-]/g)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useLocalStorageState<ThemeMode>(
    'youth-guard-theme',
    'light',
  )
  const [session, setSession] = useLocalStorageState<Session>(
    'youth-guard-session',
    initialSession,
  )
  const [profile, setProfile] = useLocalStorageState<UserProfile>(
    'youth-guard-profile',
    defaultProfile,
  )
  const [news, setNews] = useLocalStorageState<NewsItem[]>(
    'youth-guard-news',
    initialNews,
  )
  const [appeals, setAppeals] = useState<Appeal[]>(initialAppeals)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const unreadAppealCount = appeals.filter(
    (appeal) => appeal.viewedByAdmin === false,
  ).length
  const isAuthenticated = session.role === 'guest' ? false : true

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light',
    )
  }

  function signIn(payload: SignInPayload) {
    const nextDisplayName =
      payload.role === 'admin'
        ? 'Координатор штаба'
        : payload.displayName?.trim() ||
          profile.displayName ||
          buildDisplayName(payload.email)

    setSession({
      role: payload.role,
      displayName: nextDisplayName,
      email: payload.email.trim(),
      avatar: payload.role === 'admin' ? session.avatar : profile.avatar,
    })

    if (payload.role === 'user') {
      setProfile((currentProfile) => ({
        ...currentProfile,
        displayName: nextDisplayName,
        email: payload.email.trim(),
      }))
    }
  }

  function register(payload: RegisterPayload) {
    const nextProfile = {
      ...profile,
      displayName: payload.displayName.trim(),
      email: payload.email.trim(),
    }

    setProfile(nextProfile)
    setSession({
      role: 'user',
      displayName: nextProfile.displayName,
      email: nextProfile.email,
      avatar: nextProfile.avatar,
    })
  }

  function signOut() {
    setSession(initialSession)
  }

  function publishNews(draft: NewsDraft) {
    const nextNewsItem: NewsItem = {
      id: createId('news'),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      body: draft.body,
      category: draft.category,
      createdAt: new Date().toISOString(),
      author: session.displayName || 'Штаб Молодой Гвардии',
      image: draft.image,
      comments: [],
    }

    setNews((currentNews) => [nextNewsItem, ...currentNews])
  }

  function addComment(newsId: string, text: string) {
    const nextRole: NewsComment['role'] = session.role === 'admin' ? 'admin' : 'user'
    const comment: NewsComment = {
      id: createId('comment'),
      author: session.displayName,
      role: nextRole,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }

    setNews((currentNews) =>
      currentNews.map((item) =>
        item.id === newsId
          ? {
              ...item,
              comments: [...item.comments, comment],
            }
          : item,
      ),
    )
  }

  function createAppeal(draft: AppealDraft) {
    const nextAppeal: Appeal = {
      id: createId('appeal'),
      title: draft.title.trim(),
      category: draft.category,
      address: draft.address.trim(),
      text: draft.text.trim(),
      createdAt: new Date().toISOString(),
      status: 'Отправлено',
      authorName: session.displayName,
      viewedByAdmin: false,
      image: draft.image,
    }

    setAppeals((currentAppeals) => [nextAppeal, ...currentAppeals])
  }

  function updateProfile(draft: UserProfile) {
    setProfile(draft)
    setSession((currentSession) => ({
      ...currentSession,
      displayName: draft.displayName,
      email: draft.email,
      avatar: draft.avatar,
    }))
  }

  function markAppealsSeen() {
    setAppeals((currentAppeals) =>
      currentAppeals.map((appeal) => ({
        ...appeal,
        viewedByAdmin: true,
      })),
    )
  }

  function updateAppealStatus(appealId: string, nextStatus: AppealStatus) {
    setAppeals((currentAppeals) =>
      currentAppeals.map((appeal) =>
        appeal.id === appealId
          ? {
              ...appeal,
              status: nextStatus,
              viewedByAdmin: true,
            }
          : appeal,
      ),
    )
  }

  return (
    <AppStateContext.Provider
      value={{
        theme,
        session,
        profile,
        news,
        appeals,
        unreadAppealCount,
        isAuthenticated,
        toggleTheme,
        signIn,
        register,
        signOut,
        publishNews,
        addComment,
        createAppeal,
        updateProfile,
        markAppealsSeen,
        updateAppealStatus,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppStateContext)

  if (context === null) {
    throw new Error('useAppState must be used within AppStateProvider.')
  }

  return context
}
