import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded'
import { Avatar, Box, Button, Card, CardContent, CardMedia, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { NewsActionBar } from '../components/NewsActionBar'
import { formatDate } from '../lib/format'
import { getInitials } from '../lib/person'
import { useAppState } from '../state/AppState'

export function HomePage() {
  const { news, session, toggleNewsLike } = useAppState()
  const recentNews = news.slice(0, 5)
  const dashboardLink =
    session.role === 'admin'
      ? '/admin'
      : session.role === 'guest'
        ? '/auth'
        : '/profile'
  const dashboardLabel =
    session.role === 'admin'
      ? 'Открыть админку'
      : session.role === 'guest'
        ? 'Войти в кабинет'
        : 'Открыть профиль'

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Stack spacing={{ xs: 2.25, md: 2.75 }}>
        <Stack spacing={1.25} sx={{ maxWidth: '46rem' }}>
          <Typography variant="overline" color="text.secondary">
            Лента штаба
          </Typography>
          <Typography variant="h1">
            Новости, обсуждение и обращения в одном плотном интерфейсе.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Открывайте публикации, переходите к комментариям и держите под рукой
            кабинет без пустых декоративных блоков и повторяющегося hero-фото.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button component={RouterLink} to="/news" variant="contained" endIcon={<ArrowOutwardRounded />}>
              Открыть ленту
            </Button>
            <Button component={RouterLink} to="/appeal/new" variant="outlined" color="secondary">
              Оставить обращение
            </Button>
            <Button component={RouterLink} to={dashboardLink} variant="text" color="secondary">
              {dashboardLabel}
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}
          >
            <Box>
              <Typography variant="h2">Последние публикации</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '40rem', mt: 0.5 }}>
                Главная показывает только живой поток публикаций и быстрые входы,
                без пустой правой колонки и вторичного служебного контента.
              </Typography>
            </Box>
            <Button component={RouterLink} to="/news" variant="text" color="secondary" endIcon={<ArrowOutwardRounded />}>
              Вся лента
            </Button>
          </Stack>

          <Stack spacing={1.25}>
            {recentNews.map((item) => (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  transition: 'transform 220ms ease, box-shadow 220ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.shadows[1],
                  },
                  '&:hover .news-home-media': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Box component={RouterLink} to={`/news/${item.id}`} sx={{ display: 'block' }}>
                  <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>
                          {getInitials(item.author)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {item.author}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.category} · {formatDate(item.createdAt)}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction={{ xs: 'column', md: item.image === undefined ? 'column' : 'row' }}
                        spacing={2}
                        sx={{ alignItems: 'stretch' }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h3" sx={{ mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {item.summary}
                          </Typography>
                        </Box>

                        {item.image === undefined ? null : (
                          <CardMedia
                            className="news-home-media"
                            component="img"
                            image={item.image}
                            alt={item.title}
                            sx={{
                              width: { xs: '100%', md: 240 },
                              height: { xs: 220, md: 180 },
                              borderRadius: 2.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              transition: 'transform 220ms ease',
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Box>

                <Box
                  sx={{
                    px: { xs: 2.25, md: 3 },
                    py: 1.25,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <NewsActionBar
                    commentCount={item.comments.length}
                    commentTo={`/news/${item.id}#comments`}
                    isLiked={item.viewerHasLiked}
                    likeCount={item.likes}
                    onLikeClick={() => toggleNewsLike(item.id)}
                  />
                </Box>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}
