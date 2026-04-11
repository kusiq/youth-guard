import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Container,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { NewsActionBar } from '../components/NewsActionBar'
import { formatDate } from '../lib/format'
import { getInitials } from '../lib/person'
import type { NewsItem } from '../types'
import { useAppState } from '../state/AppState'

const PAGE_SIZE = 6

interface NewsFeedListProps {
  items: NewsItem[]
  onToggleLike: (newsId: string) => void
}

function NewsFeedList({ items, onToggleLike }: NewsFeedListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isPending, startTransition] = useTransition()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const visibleNews = items.slice(0, visibleCount)
  const hasMore = visibleCount < items.length

  useEffect(() => {
    const loadMoreNode = loadMoreRef.current

    if (loadMoreNode === null || hasMore === false) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting !== true) {
          return
        }

        startTransition(() => {
          setVisibleCount((currentCount) =>
            Math.min(currentCount + PAGE_SIZE, items.length),
          )
        })
      },
      {
        rootMargin: '320px 0px',
      },
    )

    observer.observe(loadMoreNode)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, items.length, startTransition])

  return (
    <Stack spacing={1.5}>
      {visibleNews.map((item) => (
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
            '&:hover .news-feed-media': {
              transform: 'scale(1.015)',
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

                <Box>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.summary}
                  </Typography>
                </Box>

                {item.image === undefined ? null : (
                  <CardMedia
                    className="news-feed-media"
                    component="img"
                    image={item.image}
                    alt={item.title}
                    sx={{
                      width: '100%',
                      aspectRatio: '16 / 10',
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'transform 220ms ease',
                    }}
                  />
                )}
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
              onLikeClick={() => onToggleLike(item.id)}
            />
          </Box>
        </Card>
      ))}

      <Box ref={hasMore ? loadMoreRef : undefined}>
        {hasMore ? (
          <Stack spacing={1.25} sx={{ py: 1 }}>
            {isPending ? <LinearProgress /> : null}
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              {isPending ? 'Подгружаем следующие публикации…' : 'Лента автоматически подтянет следующие посты.'}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1, textAlign: 'center' }}>
            Вы дошли до конца ленты.
          </Typography>
        )}
      </Box>
    </Stack>
  )
}

export function NewsPage() {
  const { news, toggleNewsLike } = useAppState()
  const [searchValue, setSearchValue] = useState('')
  const deferredSearch = useDeferredValue(searchValue)
  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filteredNews = news.filter((item) => {
    if (normalizedSearch === '') {
      return true
    }

    const haystack = [item.title, item.summary, item.category, item.author]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedSearch)
  })

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2.25}>
        <Stack spacing={0.75} sx={{ maxWidth: '42rem' }}>
          <Typography variant="overline" color="text.secondary">
            Новости
          </Typography>
          <Typography variant="h2">Лента штаба</Typography>
          <Typography variant="body1" color="text.secondary">
            Плотный поток публикаций с комментариями, реакциями и отдельной страницей
            для каждого поста. Без правых колонок и пустого экрана вокруг контента.
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' } }}
        >
          <TextField
            fullWidth
            label="Поиск по ленте"
            value={searchValue}
            placeholder="Тема, автор или категория"
            onChange={(event) => setSearchValue(event.target.value)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', pb: { sm: 1 } }}>
            {filteredNews.length} публикаций
          </Typography>
        </Stack>

        {filteredNews.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>
            По этому запросу ничего не найдено. Попробуйте убрать часть слов или
            открыть общий поток публикаций.
          </Alert>
        ) : (
          <NewsFeedList
            key={`${normalizedSearch}:${filteredNews.length}`}
            items={filteredNews}
            onToggleLike={toggleNewsLike}
          />
        )}
      </Stack>
    </Container>
  )
}
