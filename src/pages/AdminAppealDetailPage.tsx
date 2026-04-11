import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import {
  Avatar,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { appealStatuses } from '../data/mockData'
import { formatDate } from '../lib/format'
import { getInitials } from '../lib/person'
import { useAppState } from '../state/AppState'

export function AdminAppealDetailPage() {
  const { appealId } = useParams()
  const { appeals, markAppealsSeen, session, updateAppealStatus } = useAppState()
  const selectedAppeal = appeals.find((appeal) => appeal.id === appealId)

  useEffect(() => {
    if (selectedAppeal?.viewedByAdmin === false) {
      markAppealsSeen()
    }
  }, [markAppealsSeen, selectedAppeal?.viewedByAdmin])

  if (session.role !== 'admin') {
    return (
      <AccessNotice
        title="Просмотр обращения доступен только администратору."
        description="Войдите как координатор, чтобы открыть карточку обращения и поменять статус."
        actionLabel="Войти как администратор"
        to="/auth"
      />
    )
  }

  if (selectedAppeal === undefined) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack spacing={2.5}>
          <Button
            component={RouterLink}
            to="/admin"
            variant="text"
            color="secondary"
            startIcon={<ArrowBackRounded />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Назад в админку
          </Button>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Typography variant="overline" color="text.secondary">
                Обращение не найдено
              </Typography>
              <Typography variant="h2">Возможно, ссылка устарела или запись уже удалена.</Typography>
              <Typography variant="body1" color="text.secondary">
                Вернитесь в общий список обращений и откройте актуальную карточку.
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2.5}>
        <Button
          component={RouterLink}
          to="/admin"
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
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)' },
          }}
        >
          <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <Stack spacing={2.5}>
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

          <Stack spacing={2.5}>
            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="overline" color="text.secondary">
                  Статус
                </Typography>
                <StatusBadge status={selectedAppeal.status} />
                <TextField
                  select
                  label="Изменить статус"
                  value={selectedAppeal.status}
                  onChange={(event) =>
                    updateAppealStatus(appealId ?? '', event.target.value as typeof selectedAppeal.status)
                  }
                >
                  {appealStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Paper>

            <Paper sx={{ p: 2.5 }}>
              <Stack spacing={1.25}>
                <Typography variant="overline" color="text.secondary">
                  Контекст
                </Typography>
                <Typography variant="h4">{selectedAppeal.address}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Автор обращения: {selectedAppeal.authorName}
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
