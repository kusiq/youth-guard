import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import { Avatar, Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { formatDate } from '../lib/format'
import { getInitials } from '../lib/person'
import { useAppState } from '../state/AppState'

export function AppealDetailPage() {
  const { appealId } = useParams()
  const { appeals, isAuthenticated, session } = useAppState()
  const selectedAppeal = appeals.find((appeal) => appeal.id === appealId)
  const hasAccess =
    selectedAppeal !== undefined &&
    (session.role === 'admin' || selectedAppeal.authorName === session.displayName)

  if (isAuthenticated === false) {
    return (
      <AccessNotice
        title="Просмотр обращения доступен после входа."
        description="После входа можно открыть свои обращения и посмотреть текущий статус."
        actionLabel="Открыть вход"
        to="/auth"
      />
    )
  }

  if (selectedAppeal === undefined || hasAccess === false) {
    return (
      <AccessNotice
        title="Это обращение недоступно."
        description="Откройте своё обращение из списка, чтобы посмотреть детали и текущий статус."
        actionLabel="Вернуться к обращениям"
        to="/appeal/new"
      />
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2.5}>
        <Button
          component={RouterLink}
          to="/appeal/new"
          variant="text"
          color="secondary"
          startIcon={<ArrowBackRounded />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Назад к обращениям
        </Button>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.12fr) minmax(300px, 0.88fr)' },
          }}
        >
          <Paper sx={{ p: { xs: 2.5, md: 3.25 } }}>
            <Stack spacing={2.25}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>
                  {getInitials(selectedAppeal.authorName)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {selectedAppeal.authorName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedAppeal.category} · {formatDate(selectedAppeal.createdAt)}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Обращение
                </Typography>
                <Typography variant="h2" sx={{ mt: 0.75 }}>
                  {selectedAppeal.title}
                </Typography>
              </Box>

              {selectedAppeal.image === undefined ? null : (
                <Box
                  component="img"
                  src={selectedAppeal.image}
                  alt={`Фото по обращению: ${selectedAppeal.title}`}
                  sx={{
                    width: '100%',
                    aspectRatio: '16 / 10',
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}

              <Typography variant="body1" color="text.secondary">
                {selectedAppeal.text}
              </Typography>
            </Stack>
          </Paper>

          <Stack spacing={2.25} sx={{ alignSelf: 'start' }}>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.25}>
                <Typography variant="overline" color="text.secondary">
                  Статус
                </Typography>
                <StatusBadge status={selectedAppeal.status} />
                <Typography variant="body2" color="text.secondary">
                  Здесь видно, принято ли обращение, находится ли оно в работе или уже закрыто.
                </Typography>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.25}>
                <Typography variant="overline" color="text.secondary">
                  Контекст
                </Typography>
                <Typography variant="h4">{selectedAppeal.address}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Категория: {selectedAppeal.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Дата отправки: {formatDate(selectedAppeal.createdAt)}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
