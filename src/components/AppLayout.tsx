import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { SiteFooter } from './SiteFooter'

export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <a className="skip-link" href="#main-content">
        Перейти к содержанию
      </a>
      <AppHeader />
      <Box
        component="main"
        id="main-content"
        sx={{
          display: 'block',
        }}
      >
        <Outlet />
      </Box>
      <SiteFooter />
    </Box>
  )
}
