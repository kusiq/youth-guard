import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded'
import ArticleRounded from '@mui/icons-material/ArticleRounded'
import HomeRounded from '@mui/icons-material/HomeRounded'
import MenuRounded from '@mui/icons-material/MenuRounded'
import PersonRounded from '@mui/icons-material/PersonRounded'
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { roleLabels } from '../data/mockData'
import { useAppState } from '../state/AppState'
import { ThemeToggle } from './ThemeToggle'

const primaryLinks = [
  { to: '/', label: 'Главная', icon: <HomeRounded fontSize="small" /> },
  { to: '/news', label: 'Новости', icon: <ArticleRounded fontSize="small" /> },
  { to: '/appeal/new', label: 'Обращение', icon: <ReportProblemRounded fontSize="small" /> },
]

export function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()
  const { isAuthenticated, session, signOut, unreadAppealCount } = useAppState()
  const statusLabel = isAuthenticated ? roleLabels[session.role] : ''
  const navigationItems = [
    ...primaryLinks,
    ...(isAuthenticated
      ? [{ to: '/profile', label: 'Профиль', icon: <PersonRounded fontSize="small" /> }]
      : []),
    ...(session.role === 'admin'
      ? [{ to: '/admin', label: 'Админка', icon: <AdminPanelSettingsRounded fontSize="small" /> }]
      : []),
  ]

  function closeMenu() {
    setIsMenuOpen(false)
  }

  function openSignOutDialog() {
    setIsSignOutDialogOpen(true)
  }

  function closeSignOutDialog() {
    setIsSignOutDialogOpen(false)
  }

  function confirmSignOut() {
    closeSignOutDialog()
    signOut()
  }

  function isActiveLink(path: string) {
    if (path === '/') {
      return location.pathname === '/'
    }

    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 76, gap: 2 }}>
            <Box
              component={RouterLink}
              to="/"
              onClick={closeMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minWidth: 0,
                color: 'text.primary',
                flexShrink: 0,
                flex: { xs: 1, md: '0 0 auto' },
                pr: { xs: 1, md: 0 },
              }}
            >
              <Avatar
                variant="rounded"
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 800,
                }}
              >
                МК
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{ fontWeight: 800, fontSize: { xs: '0.98rem', sm: '1rem' } }}
                >
                  Молодая Гвардия
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Кострома
                </Typography>
              </Box>
            </Box>

            {isMobile ? (
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThemeToggle />
                <IconButton
                  aria-label={isMenuOpen ? 'Закрыть навигацию' : 'Открыть навигацию'}
                  onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
                  sx={{
                    width: 42,
                    height: 42,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                  }}
                >
                  <MenuRounded sx={{ fontSize: 22 }} />
                </IconButton>
              </Box>
            ) : (
              <>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    flex: 1,
                    justifyContent: 'center',
                    minWidth: 0,
                    px: 2,
                  }}
                >
                  {navigationItems.map((item) => {
                    const isActive = isActiveLink(item.to)

                    return (
                      <Button
                        key={item.to}
                        component={RouterLink}
                        to={item.to}
                        color={isActive ? 'primary' : 'secondary'}
                        startIcon={item.to === '/admin' ? (
                          <Badge badgeContent={unreadAppealCount} color="primary">
                            {item.icon}
                          </Badge>
                        ) : item.icon}
                        variant={isActive ? 'contained' : 'text'}
                        sx={{
                          px: 2,
                        }}
                      >
                        {item.label}
                      </Button>
                    )
                  })}
                </Stack>

                <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0, alignItems: 'center' }}>
                  {statusLabel === '' ? null : (
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                      {statusLabel}
                    </Typography>
                  )}
                  <ThemeToggle />
                  {isAuthenticated ? (
                    <Button variant="outlined" color="secondary" onClick={openSignOutDialog}>
                      Выйти
                    </Button>
                  ) : (
                    <Button component={RouterLink} to="/auth" variant="outlined" color="secondary">
                      Войти
                    </Button>
                  )}
                </Stack>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="top"
        open={isMenuOpen}
        onClose={closeMenu}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              p: 2,
            },
          },
        }}
      >
        <Container maxWidth="sm" sx={{ py: 1 }}>
          <Stack spacing={1.5}>
            {statusLabel === '' ? null : (
              <Chip label={statusLabel} color="default" sx={{ alignSelf: 'flex-start' }} />
            )}

            <Stack spacing={1}>
              {navigationItems.map((item) => (
                <Button
                  key={item.to}
                  component={RouterLink}
                  to={item.to}
                  onClick={closeMenu}
                  fullWidth
                  startIcon={item.icon}
                  variant={isActiveLink(item.to) ? 'contained' : 'outlined'}
                  color={isActiveLink(item.to) ? 'primary' : 'secondary'}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            {session.role === 'admin' && unreadAppealCount > 0 ? (
              <Typography variant="body2" color="text.secondary">
                Новых обращений: {unreadAppealCount}
              </Typography>
            ) : null}

            {isAuthenticated ? (
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => {
                  closeMenu()
                  openSignOutDialog()
                }}
              >
                Выйти
              </Button>
            ) : (
              <Button component={RouterLink} to="/auth" fullWidth variant="contained" onClick={closeMenu}>
                Войти
              </Button>
            )}
          </Stack>
        </Container>
      </Drawer>

      <Dialog open={isSignOutDialogOpen} onClose={closeSignOutDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Выйти из кабинета?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Текущая сессия завершится, и для новых комментариев или обращений нужно будет войти снова.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={closeSignOutDialog}>
            Отмена
          </Button>
          <Button variant="contained" onClick={confirmSignOut}>
            Выйти
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
