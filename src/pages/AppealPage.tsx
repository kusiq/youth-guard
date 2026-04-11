import UploadRounded from '@mui/icons-material/UploadRounded'
import {
  Alert,
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState, useTransition } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { appealCategories } from '../data/mockData'
import { formatDate } from '../lib/format'
import { readFileAsDataUrl } from '../lib/file'
import { useAppState } from '../state/AppState'

export function AppealPage() {
  const { appeals, createAppeal, isAuthenticated, session } = useAppState()
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState('')
  const [form, setForm] = useState({
    title: 'Проблема во дворе',
    category: appealCategories[0],
    address: 'Кострома, ул. Советская, 27',
    text: 'Опишите ситуацию, приложите фото и дайте короткий контекст: когда заметили проблему и что уже предпринимали.',
    image: '',
  })

  if (isAuthenticated === false) {
    return (
      <AccessNotice
        title="Чтобы отправить обращение, войдите в кабинет."
        description="После входа можно прикрепить фото, указать адрес и отслеживать статус обращения."
        actionLabel="Открыть вход"
        to="/auth"
      />
    )
  }

  const myAppeals = appeals
    .filter((appeal) => appeal.authorName === session.displayName)

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    const image = await readFileAsDataUrl(file, { maxDimension: 1280, quality: 0.82 })
    setForm((currentForm) => ({
      ...currentForm,
      image,
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      createAppeal({
        title: form.title,
        category: form.category,
        address: form.address,
        text: form.text,
        image: form.image || undefined,
      })

      setSuccessMessage('Обращение отправлено. Администратор увидит его в личном кабинете с уведомлением.')
      setForm((currentForm) => ({
        ...currentForm,
        title: '',
        address: '',
        text: '',
        image: '',
      }))
    })
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2.25,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(300px, 0.9fr)' },
        }}
      >
        <Paper sx={{ p: { xs: 2.25, md: 2.75 } }}>
          <Stack spacing={2.25} component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Обращение
              </Typography>
              <Typography variant="h2" sx={{ mt: 0.75 }}>
                Новое обращение
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Укажите адрес, коротко опишите проблему и приложите фото. Администратор увидит всё это в отдельной карточке обращения.
              </Typography>
            </Box>

            <TextField
              label="Заголовок"
              name="title"
              value={form.title}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  title: event.target.value,
                }))
              }
            />
            <TextField
              select
              label="Категория"
              name="category"
              value={form.category}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  category: event.target.value,
                }))
              }
            >
              {appealCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Адрес"
              name="street-address"
              autoComplete="street-address"
              value={form.address}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  address: event.target.value,
                }))
              }
            />
            <TextField
              label="Описание"
              name="description"
              multiline
              minRows={5}
              value={form.text}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  text: event.target.value,
                }))
              }
            />

            <Stack spacing={1}>
              <Button component="label" variant="outlined" color="secondary" startIcon={<UploadRounded />} sx={{ alignSelf: 'flex-start' }}>
                Добавить фото
                <input hidden type="file" accept="image/*" onChange={handleImageChange} />
              </Button>
              {form.image === '' ? null : (
                <Box
                  component="img"
                  src={form.image}
                  alt="Предпросмотр обращения"
                  sx={{
                    width: '100%',
                    maxWidth: 420,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Stack>

            <Button type="submit" variant="contained" disabled={isPending} sx={{ alignSelf: 'flex-start' }}>
              {isPending ? 'Отправляем обращение...' : 'Отправить обращение'}
            </Button>

            {successMessage === '' ? null : <Alert severity="success">{successMessage}</Alert>}
          </Stack>
        </Paper>

        <Stack spacing={2}>
          <Paper sx={{ p: 2.25 }}>
            <Stack spacing={1.25}>
              <Typography variant="overline" color="text.secondary">
                Что стоит приложить сразу
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Точный адрес, фото текущего состояния места и короткий понятный контекст без лишнего фона.
              </Typography>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2.25 }}>
            <Stack spacing={1.5}>
              <Typography variant="overline" color="text.secondary">
                Мои обращения
              </Typography>
              {myAppeals.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Пока нет отправленных обращений.
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
