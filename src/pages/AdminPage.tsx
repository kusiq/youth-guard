import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded'
import MarkunreadMailboxRounded from '@mui/icons-material/MarkunreadMailboxRounded'
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded'
import NewspaperRounded from '@mui/icons-material/NewspaperRounded'
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
import { useDeferredValue, useEffect, useRef, useState, useTransition } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { newsCategories } from '../data/mockData'
import { formatDate } from '../lib/format'
import { readFileAsDataUrl } from '../lib/file'
import { getInitials } from '../lib/person'
import { useAppState } from '../state/AppState'

export function AdminPage() {
  const {
    appeals,
    markAppealsSeen,
    news,
    publishNews,
    session,
    unreadAppealCount,
  } = useAppState()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState('')
  const [newsForm, setNewsForm] = useState({
    title: 'Новая публикация штаба',
    summary: 'Короткий текст для ленты: о чем пост и что в нем самое важное.',
    category: newsCategories[0],
    body: 'Первый абзац публикации.\n\nВторой абзац с фактами, контекстом или следующим шагом.',
    image: '',
  })
  const deferredSearch = useDeferredValue(searchValue)
  const hasMarkedInbox = useRef(false)

  useEffect(() => {
    if (hasMarkedInbox.current) {
      return
    }

    markAppealsSeen()
    hasMarkedInbox.current = true
  }, [markAppealsSeen])

  if (session.role !== 'admin') {
    return (
      <AccessNotice
        title="Админка доступна только координатору."
        description="Обычный пользователь может читать новости и оставлять обращения, но не управляет входящими задачами."
        actionLabel="Войти как администратор"
        to="/auth"
      />
    )
  }

  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filteredAppeals = appeals.filter((appeal) => {
    if (normalizedSearch === '') {
      return true
    }

    const haystack = [appeal.title, appeal.address, appeal.authorName, appeal.text]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedSearch)
  })

  async function handleNewsImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    const image = await readFileAsDataUrl(file, { maxDimension: 1280, quality: 0.82 })
    setNewsForm((currentForm) => ({
      ...currentForm,
      image,
    }))
  }

  function handleNewsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      publishNews({
        title: newsForm.title,
        summary: newsForm.summary,
        category: newsForm.category,
        body: newsForm.body
          .split('\n\n')
          .map((part) => part.trim())
          .filter((part) => part.length > 0),
        image: newsForm.image || undefined,
      })

      setNewsForm((currentForm) => ({
        ...currentForm,
        title: '',
        summary: '',
        body: '',
        image: '',
      }))
    })
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.2fr) minmax(340px, 0.8fr)' },
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Админка
            </Typography>
            <Typography variant="h2" sx={{ mt: 0.75 }}>
              Входящие обращения
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Открывайте обращения как отдельные карточки, смотрите фото и меняйте статус без перегруженного списка.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Paper sx={{ p: 2, minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <MarkunreadMailboxRounded color="primary" />
                <Box>
                  <Typography variant="h4">{filteredAppeals.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    обращений в списке
                  </Typography>
                </Box>
              </Stack>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <NotificationsActiveRounded color="primary" />
                <Box>
                  <Typography variant="h4">{unreadAppealCount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    новых до просмотра
                  </Typography>
                </Box>
              </Stack>
            </Paper>
            <Paper sx={{ p: 2, minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <NewspaperRounded color="primary" />
                <Box>
                  <Typography variant="h4">{news.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    публикаций в ленте
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>

          <TextField
            label="Поиск по обращениям"
            value={searchValue}
            placeholder="Двор, стадион, Советская"
            onChange={(event) => setSearchValue(event.target.value)}
          />

          <Stack spacing={1.5}>
            {filteredAppeals.map((appeal) => (
              <Paper
                key={appeal.id}
                component={RouterLink}
                to={`/admin/appeals/${appeal.id}`}
                sx={{
                  p: 2.5,
                  display: 'block',
                  transition: 'transform 180ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack spacing={1.25}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>
                        {getInitials(appeal.authorName)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                          {appeal.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appeal.category} · {formatDate(appeal.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                      <StatusBadge status={appeal.status} />
                      <Typography variant="caption" color="text.secondary">
                        {appeal.image === undefined ? 'Без фото' : 'Есть фото'}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="h4">{appeal.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appeal.address}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {appeal.text}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>
                    Открыть обращение
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>

        <Paper sx={{ p: { xs: 2.5, md: 3 }, alignSelf: 'start' }}>
          <Stack spacing={2} component="form" onSubmit={handleNewsSubmit}>
            <Box>
              <Typography variant="overline" color="text.secondary">
                Новый пост
              </Typography>
              <Typography variant="h3" sx={{ mt: 0.75 }}>
                Опубликовать новость
              </Typography>
            </Box>

            <TextField
              label="Заголовок"
              value={newsForm.title}
              onChange={(event) =>
                setNewsForm((currentForm) => ({
                  ...currentForm,
                  title: event.target.value,
                }))
              }
            />
            <TextField
              label="Короткая выжимка"
              multiline
              minRows={3}
              value={newsForm.summary}
              onChange={(event) =>
                setNewsForm((currentForm) => ({
                  ...currentForm,
                  summary: event.target.value,
                }))
              }
            />
            <TextField
              select
              label="Категория"
              value={newsForm.category}
              onChange={(event) =>
                setNewsForm((currentForm) => ({
                  ...currentForm,
                  category: event.target.value,
                }))
              }
            >
              {newsCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Текст публикации"
              multiline
              minRows={6}
              value={newsForm.body}
              onChange={(event) =>
                setNewsForm((currentForm) => ({
                  ...currentForm,
                  body: event.target.value,
                }))
              }
            />

            <Stack spacing={1}>
              <Button component="label" variant="outlined" color="secondary" startIcon={<AddPhotoAlternateRounded />} sx={{ alignSelf: 'flex-start' }}>
                Добавить фото
                <input hidden type="file" accept="image/*" onChange={handleNewsImageChange} />
              </Button>
              {newsForm.image === '' ? null : (
                <Box
                  component="img"
                  src={newsForm.image}
                  alt="Предпросмотр публикации"
                  sx={{
                    width: '100%',
                    borderRadius: 2.25,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Stack>

            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? 'Публикуем...' : 'Опубликовать'}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Container>
  )
}
