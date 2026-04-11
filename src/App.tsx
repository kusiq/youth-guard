import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AppThemeProvider } from './components/AppThemeProvider'
import { RouteLoading } from './components/RouteLoading'
import { ScrollToTop } from './components/ScrollToTop'
import { AppStateProvider } from './state/AppState'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const NewsPage = lazy(() =>
  import('./pages/NewsPage').then((module) => ({ default: module.NewsPage })),
)
const NewsDetailPage = lazy(() =>
  import('./pages/NewsDetailPage').then((module) => ({
    default: module.NewsDetailPage,
  })),
)
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })),
)
const AppealPage = lazy(() =>
  import('./pages/AppealPage').then((module) => ({ default: module.AppealPage })),
)
const AppealDetailPage = lazy(() =>
  import('./pages/AppealDetailPage').then((module) => ({
    default: module.AppealDetailPage,
  })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })),
)
const AdminAppealDetailPage = lazy(() =>
  import('./pages/AdminAppealDetailPage').then((module) => ({
    default: module.AdminAppealDetailPage,
  })),
)

export function App() {
  return (
    <AppStateProvider>
      <AppThemeProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="news" element={<NewsPage />} />
                <Route path="news/:newsId" element={<NewsDetailPage />} />
                <Route path="auth" element={<AuthPage />} />
                <Route path="appeal/new" element={<AppealPage />} />
                <Route path="appeal/:appealId" element={<AppealDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="admin/appeals/:appealId" element={<AdminAppealDetailPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppThemeProvider>
    </AppStateProvider>
  )
}
