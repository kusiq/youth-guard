import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState, useTransition } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { NewsActionBar } from '../components/NewsActionBar'
import { roleLabels } from '../data/mockData'
import { formatDate } from '../lib/format'
import { getInitials } from '../lib/person'
import { useAppState } from '../state/AppState'

export function NewsDetailPage() {
  const { newsId } = useParams()
  const { addComment, isAuthenticated, news, toggleNewsLike } = useAppState()
  const [commentText, setCommentText] = useState('')
  const [isPending, startTransition] = useTransition()
  const selectedNews = news.find((item) => item.id === newsId)
  const moreNews = news.filter((item) => item.id !== newsId).slice(0, 3)

  function scrollToComments() {
    document.getElementById('comments')?.scrollIntoView({
      block: 'start',
      behavior: 'smooth',
    })
  }

  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (selectedNews === undefined || commentText.trim() === '') {
      return
    }

    startTransition(() => {
      addComment(selectedNews.id, commentText)
      setCommentText('')
    })
  }

  if (selectedNews === undefined) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack spacing={2.5}>
          <Button
            component={RouterLink}
            to="/news"
            variant="text"
            color="secondary"
            startIcon={<ArrowBackRounded />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Назад к ленте
          </Button>
          <Paper sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Typography variant="overline" color="text.secondary">
                Публикация не найдена
              </Typography>
              <Typography variant="h2">Ссылка устарела или пост уже недоступен.</Typography>
              <Typography variant="body1" color="text.secondary">
                Вернитесь в общую ленту и откройте актуальную публикацию.
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Stack spacing={3}>
        <Button
          component={RouterLink}
          to="/news"
          variant="text"
          color="secondary"
          startIcon={<ArrowBackRounded />}
          sx={{ alignSelf: 'flex-start' }}
        >
          Назад к ленте
        </Button>

        <Paper sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>
                {getInitials(selectedNews.author)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {selectedNews.author}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedNews.category} · {formatDate(selectedNews.createdAt)}
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Typography variant="h2" sx={{ mb: 1 }}>
                {selectedNews.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selectedNews.summary}
              </Typography>
            </Box>

            {selectedNews.image === undefined ? null : (
              <CardMedia
                component="img"
                image={selectedNews.image}
                alt={selectedNews.title}
                sx={{
                  width: '100%',
                  aspectRatio: '16 / 10',
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            )}

            <NewsActionBar
              commentCount={selectedNews.comments.length}
              isLiked={selectedNews.viewerHasLiked}
              likeCount={selectedNews.likes}
              onCommentClick={scrollToComments}
              onLikeClick={() => toggleNewsLike(selectedNews.id)}
            />

            <Divider />

            <Stack spacing={1.5}>
              {selectedNews.body.map((paragraph) => (
                <Typography key={paragraph} variant="body1" color="text.primary">
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Stack spacing={2} id="comments" sx={{ scrollMarginTop: { xs: 92, md: 104 } }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Обсуждение
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5 }}>
              {selectedNews.comments.length} комментариев
            </Typography>
          </Box>

          {selectedNews.comments.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              Пока никто не написал комментарий. Можно начать обсуждение первым.
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {selectedNews.comments.map((comment) => (
                <Card key={comment.id} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <Avatar
                        src={comment.avatar}
                        alt={comment.author}
                        sx={{ bgcolor: comment.role === 'admin' ? 'secondary.main' : 'primary.main' }}
                      >
                        {getInitials(comment.author)}
                      </Avatar>
                      <Stack spacing={0.8} sx={{ minWidth: 0, flex: 1 }}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
                        >
                          <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {comment.author}
                            </Typography>
                            <Chip size="small" label={roleLabels[comment.role]} variant="outlined" />
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(comment.createdAt)}
                          </Typography>
                        </Stack>
                        <Typography variant="body1" color="text.secondary">
                          {comment.text}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          {isAuthenticated ? (
            <Paper sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack component="form" spacing={1.5} onSubmit={handleCommentSubmit}>
                <TextField
                  label="Добавить комментарий"
                  multiline
                  minRows={4}
                  value={commentText}
                  placeholder="Напишите короткий комментарий к публикации"
                  onChange={(event) => setCommentText(event.target.value)}
                />
                <Button variant="contained" type="submit" disabled={isPending} sx={{ alignSelf: 'flex-start' }}>
                  {isPending ? 'Публикуем...' : 'Опубликовать комментарий'}
                </Button>
              </Stack>
            </Paper>
          ) : (
            <Paper sx={{ p: { xs: 2, md: 2.5 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
              >
                <Typography variant="body1" color="text.secondary">
                  Чтобы участвовать в обсуждении, войдите в личный кабинет.
                </Typography>
                <Button component={RouterLink} to="/auth" variant="contained">
                  Перейти ко входу
                </Button>
              </Stack>
            </Paper>
          )}
        </Stack>

        {moreNews.length === 0 ? null : (
          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">
              Дальше в ленте
            </Typography>
            <Stack spacing={1.25}>
              {moreNews.map((item) => (
                <Paper
                  key={item.id}
                  component={RouterLink}
                  to={`/news/${item.id}`}
                  sx={{
                    p: 2.25,
                    display: 'block',
                    transition: 'transform 180ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.author} · {formatDate(item.createdAt)}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, mb: 0.75 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.summary}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
