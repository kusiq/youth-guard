/* eslint-disable react-refresh/only-export-components */
import {
  useCallback,
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
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
  toggleNewsLike: (newsId: string) => void
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

function normalizeNewsItems(items: NewsItem[]) {
  return items.map((item) => ({
    ...item,
    likes: item.likes ?? 0,
    viewerHasLiked: item.viewerHasLiked ?? false,
    comments: (item.comments ?? []).map((comment) => ({
      ...comment,
      avatar: comment.avatar ?? undefined,
    })),
  }))
}

function normalizeAppeals(items: Appeal[]) {
  return items.map((item) => ({
    ...item,
    viewedByAdmin: item.viewedByAdmin ?? false,
  }))
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
    normalizeNewsItems(initialNews),
  )
  const [appeals, setAppeals] = useLocalStorageState<Appeal[]>(
    'youth-guard-appeals',
    normalizeAppeals(initialAppeals),
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    const normalizedNews = normalizeNewsItems(news)
    const hasLegacyShape = normalizedNews.some(
      (item, index) =>
        item.likes !== news[index]?.likes ||
        item.viewerHasLiked !== news[index]?.viewerHasLiked,
    )

    if (hasLegacyShape) {
      setNews(normalizedNews)
    }
  }, [news, setNews])

  useEffect(() => {
    const normalizedAppeals = normalizeAppeals(appeals)
    const hasLegacyShape = normalizedAppeals.some(
      (item, index) => item.viewedByAdmin !== appeals[index]?.viewedByAdmin,
    )

    if (hasLegacyShape) {
      setAppeals(normalizedAppeals)
    }
  }, [appeals, setAppeals])

  const unreadAppealCount = appeals.filter(
    (appeal) => appeal.viewedByAdmin === false,
  ).length
  const isAuthenticated = session.role === 'guest' ? false : true

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light',
    )
  }, [setTheme])

  const signIn = useCallback((payload: SignInPayload) => {
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
  }, [profile.avatar, profile.displayName, session.avatar, setProfile, setSession])

  const register = useCallback((payload: RegisterPayload) => {
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
  }, [profile, setProfile, setSession])

  const signOut = useCallback(() => {
    setSession(initialSession)
  }, [setSession])

  const publishNews = useCallback((draft: NewsDraft) => {
    const nextNewsItem: NewsItem = {
      id: createId('news'),
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      body: draft.body,
      category: draft.category,
      createdAt: new Date().toISOString(),
      author: session.displayName || 'Штаб Молодой Гвардии',
      image: draft.image,
      likes: 0,
      viewerHasLiked: false,
      comments: [],
    }

    setNews((currentNews) => [nextNewsItem, ...currentNews])
  }, [session.displayName, setNews])

  const toggleNewsLike = useCallback((newsId: string) => {
    setNews((currentNews) =>
      currentNews.map((item) => {
        if (item.id !== newsId) {
          return item
        }

        return {
          ...item,
          likes: item.viewerHasLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
          viewerHasLiked: item.viewerHasLiked ? false : true,
        }
      }),
    )
  }, [setNews])

  const addComment = useCallback((newsId: string, text: string) => {
    const nextRole: NewsComment['role'] = session.role === 'admin' ? 'admin' : 'user'
    const comment: NewsComment = {
      id: createId('comment'),
      author: session.displayName,
      role: nextRole,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      avatar: session.avatar,
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
  }, [session.avatar, session.displayName, session.role, setNews])

  const createAppeal = useCallback((draft: AppealDraft) => {
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
  }, [session.displayName, setAppeals])

  const updateProfile = useCallback((draft: UserProfile) => {
    setProfile(draft)
    setSession((currentSession) => ({
      ...currentSession,
      displayName: draft.displayName,
      email: draft.email,
      avatar: draft.avatar,
    }))
  }, [setProfile, setSession])

  const markAppealsSeen = useCallback(() => {
    setAppeals((currentAppeals) =>
      currentAppeals.some((appeal) => appeal.viewedByAdmin === false)
        ? currentAppeals.map((appeal) => ({
            ...appeal,
            viewedByAdmin: true,
          }))
        : currentAppeals,
    )
  }, [setAppeals])

  const updateAppealStatus = useCallback((appealId: string, nextStatus: AppealStatus) => {
    setAppeals((currentAppeals) =>
      currentAppeals.map((appeal) =>
        appeal.id === appealId
          ? appeal.status === nextStatus && appeal.viewedByAdmin
            ? appeal
            : {
                ...appeal,
                status: nextStatus,
                viewedByAdmin: true,
              }
          : appeal,
      ),
    )
  }, [setAppeals])

  const value = useMemo(
    () => ({
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
      toggleNewsLike,
      addComment,
      createAppeal,
      updateProfile,
      markAppealsSeen,
      updateAppealStatus,
    }),
    [
      addComment,
      appeals,
      createAppeal,
      isAuthenticated,
      markAppealsSeen,
      news,
      profile,
      publishNews,
      register,
      session,
      signIn,
      signOut,
      theme,
      toggleNewsLike,
      toggleTheme,
      unreadAppealCount,
      updateAppealStatus,
      updateProfile,
    ],
  )

  return (
    <AppStateContext.Provider
      value={value}
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
