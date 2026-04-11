import { Box, Container, Stack, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppState'

export function SiteFooter() {
  const { isAuthenticated, session } = useAppState()
  const accountLink = session.role === 'admin' ? '/admin' : '/profile'
  const accountLabel =
    session.role === 'admin'
      ? 'Админка'
      : isAuthenticated
        ? 'Профиль'
        : 'Войти'

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 2.25,
        mt: 2.5,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              Молодая Гвардия Костромы
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Городская лента, обращения жителей и рабочий кабинет без лишнего chrome.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 2 }}
            aria-label="Нижняя навигация"
          >
            <Link to="/news">Новости</Link>
            <Link to="/appeal/new">Обращение</Link>
            <Link to={isAuthenticated ? accountLink : '/auth'}>{accountLabel}</Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
