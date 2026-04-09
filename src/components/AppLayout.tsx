import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { SiteFooter } from './SiteFooter'

export function AppLayout() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <AppHeader />
      <main className="site-main" id="main-content">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
