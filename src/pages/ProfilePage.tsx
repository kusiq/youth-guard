import UploadRounded from '@mui/icons-material/UploadRounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState, useTransition } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { interestOptions } from '../data/mockData'
import { formatDate } from '../lib/format'
import { readFileAsDataUrl } from '../lib/file'
import { getInitials } from '../lib/person'
import { useAppState } from '../state/AppState'
import type { UserProfile } from '../types'

export function ProfilePage() {
  const { appeals, isAuthenticated, profile, session, updateProfile } = useAppState()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<UserProfile>(profile)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setForm(profile)
  }, [profile])

  if (isAuthenticated === false) {
    return (
      <AccessNotice
        title="Профиль доступен после входа."
        description="В кабинете можно обновить данные, выбрать фото и отслеживать обращения."
        actionLabel="Открыть вход"
        to="/auth"
      />
    )
  }

  const myAppeals = appeals.filter((appeal) => appeal.authorName === session.displayName)

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    const avatar = await readFileAsDataUrl(file, { maxDimension: 512, quality: 0.8 })
    setForm((currentForm) => ({
      ...currentForm,
      avatar,
    }))
  }

  function toggleInterest(interest: string) {
    const hasInterest = form.interests.includes(interest)

    setForm((currentForm) => ({
      ...currentForm,
      interests: hasInterest
        ? currentForm.interests.filter((item) => item !== interest)
        : [...currentForm.interests, interest],
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      updateProfile(form)
      setStatusMessage('Профиль обновлён. Новые данные уже видны в кабинете.')
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)' },
        }}
      >
        <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={2.25} component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Профиль
              </Typography>
              <Typography variant="h2" sx={{ mt: 0.75 }}>
                Личный кабинет
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Обновите данные, загрузите фото и держите под рукой историю своих обращений.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
            >
              <Avatar
                src={form.avatar}
                alt={form.displayName}
                sx={{ width: 86, height: 86, fontSize: 28, bgcolor: 'primary.main' }}
              >
                {getInitials(form.displayName || session.displayName)}
              </Avatar>
              <Stack spacing={1}>
                <Button component="label" variant="outlined" color="secondary" startIcon={<UploadRounded />}>
                  Выбрать фото профиля
                  <input hidden type="file" accept="image/*" onChange={handleAvatarChange} />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Аватар будет показан в кабинете и рядом с вашими будущими комментариями.
                </Typography>
              </Stack>
            </Stack>

            <TextField
              label="Имя"
              name="displayName"
              autoComplete="name"
              value={form.displayName}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  displayName: event.target.value,
                }))
              }
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  email: event.target.value,
                }))
              }
            />
            <TextField
              label="Город"
              name="address-level2"
              autoComplete="address-level2"
              value={form.city}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  city: event.target.value,
                }))
              }
            />
            <TextField
              label="Телефон"
              name="tel"
              type="tel"
              autoComplete="tel"
              slotProps={{ htmlInput: { inputMode: 'tel' } }}
              value={form.phone}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  phone: event.target.value,
                }))
              }
            />
            <TextField
              label="О себе"
              name="bio"
              multiline
              minRows={4}
              value={form.bio}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  bio: event.target.value,
                }))
              }
            />

            <Stack spacing={1.25}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Интересы
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {interestOptions.map((interest) => {
                  const isSelected = form.interests.includes(interest)

                  return (
                    <Chip
                      key={interest}
                      label={interest}
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => toggleInterest(interest)}
                    />
                  )
                })}
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <Button type="submit" variant="contained" disabled={isPending}>
                {isPending ? 'Сохраняем профиль...' : 'Сохранить изменения'}
              </Button>
              {statusMessage === '' ? null : (
                <Alert severity="success" sx={{ flex: 1 }}>
                  {statusMessage}
                </Alert>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Stack spacing={2.5}>
          <Paper sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Typography variant="overline" color="text.secondary">
                Карточка участника
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Avatar
                  src={form.avatar}
                  alt={form.displayName}
                  sx={{ width: 64, height: 64, fontSize: 22, bgcolor: 'primary.main' }}
                >
                  {getInitials(form.displayName || session.displayName)}
                </Avatar>
                <Box>
                  <Typography variant="h4">{form.displayName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.city}
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {form.bio}
              </Typography>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Typography variant="overline" color="text.secondary">
                История обращений
              </Typography>
              {myAppeals.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Пока у вас нет отправленных обращений.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {myAppeals.map((appeal) => (
                    <Paper
                      key={appeal.id}
                      component={RouterLink}
                      to={`/appeal/${appeal.id}`}
                      sx={{
                        p: 2,
                        display: 'block',
                        transition: 'transform 180ms ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {appeal.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appeal.address}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <StatusBadge status={appeal.status} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(appeal.createdAt)}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                          Открыть обращение
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Container>
  )
}
