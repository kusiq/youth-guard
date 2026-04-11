/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  defaultProfile,
  initialAppeals,
  initialNews,
  initialSession,
} from '../data/mockData'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { api } from '../lib/api'
import type {
  Appeal,
  AppealDraft,
  AppealStatus,
  AppSnapshot,
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
  const [session, setSession] = useState<Session>(initialSession)
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [news, setNews] = useState<NewsItem[]>(normalizeNewsItems(initialNews))
  const [appeals, setAppeals] = useState<Appeal[]>(normalizeAppeals(initialAppeals))
  const [unreadAppealCount, setUnreadAppealCount] = useState(0)

  const applySnapshot = useCallback((snapshot: AppSnapshot) => {
    setSession(snapshot.session)
    setProfile(snapshot.profile)
    setNews(normalizeNewsItems(snapshot.news))
    setAppeals(normalizeAppeals(snapshot.appeals))
    setUnreadAppealCount(snapshot.unreadAppealCount)
  }, [])

  const syncRequest = useCallback(async (request: Promise<AppSnapshot>) => {
    try {
      const snapshot = await request
      applySnapshot(snapshot)
    } catch (error) {
      console.error(error)
    }
  }, [applySnapshot])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => {
    let isMounted = true

    async function bootstrapAppState() {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const snapshot = await api.getAppState()

          if (isMounted) {
            applySnapshot(snapshot)
          }

          return
        } catch (error) {
          if (attempt === 7) {
            console.error(error)
            return
          }

          await new Promise((resolve) => {
            window.setTimeout(resolve, 250)
          })
        }
      }
    }

    void bootstrapAppState()

    return () => {
      isMounted = false
    }
  }, [applySnapshot])

  const isAuthenticated = session.role !== 'guest'

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light',
    )
  }, [setTheme])

  const signIn = useCallback((payload: SignInPayload) => {
    void syncRequest(api.signIn(payload))
  }, [syncRequest])

  const register = useCallback((payload: RegisterPayload) => {
    void syncRequest(api.register(payload))
  }, [syncRequest])

  const signOut = useCallback(() => {
    void syncRequest(api.signOut())
  }, [syncRequest])

  const publishNews = useCallback((draft: NewsDraft) => {
    void syncRequest(api.publishNews(draft))
  }, [syncRequest])

  const toggleNewsLike = useCallback((newsId: string) => {
    void syncRequest(api.toggleNewsLike(newsId))
  }, [syncRequest])

  const addComment = useCallback((newsId: string, text: string) => {
    void syncRequest(api.addComment(newsId, text))
  }, [syncRequest])

  const createAppeal = useCallback((draft: AppealDraft) => {
    void syncRequest(api.createAppeal(draft))
  }, [syncRequest])

  const updateProfile = useCallback((draft: UserProfile) => {
    void syncRequest(api.updateProfile(draft))
  }, [syncRequest])

  const markAppealsSeen = useCallback(() => {
    void syncRequest(api.markAppealsSeen())
  }, [syncRequest])

  const updateAppealStatus = useCallback((appealId: string, nextStatus: AppealStatus) => {
    void syncRequest(api.updateAppealStatus(appealId, nextStatus))
  }, [syncRequest])

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

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)

  if (context === null) {
    throw new Error('useAppState must be used within AppStateProvider.')
  }

  return context
}
