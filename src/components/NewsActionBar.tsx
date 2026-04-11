import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded'
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteRounded from '@mui/icons-material/FavoriteRounded'
import { alpha } from '@mui/material/styles'
import { Button, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

interface NewsActionBarProps {
  commentCount: number
  commentTo?: string
  isLiked: boolean
  likeCount: number
  onCommentClick?: () => void
  onLikeClick: () => void
}

const baseButtonSx = {
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  width: 'auto',
  maxWidth: '100%',
  minHeight: 42,
  px: 2.25,
  whiteSpace: 'nowrap',
  flexShrink: 0,
  borderRadius: 2.5,
  fontVariantNumeric: 'tabular-nums',
  fontWeight: 700,
  transition:
    'background-color 180ms ease, color 180ms ease, border-color 180ms ease, transform 180ms ease',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
} as const

export function NewsActionBar({
  commentCount,
  commentTo,
  isLiked,
  likeCount,
  onCommentClick,
  onLikeClick,
}: NewsActionBarProps) {
  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      <Button
        variant={isLiked ? 'contained' : 'text'}
        color={isLiked ? 'primary' : 'secondary'}
        startIcon={isLiked ? <FavoriteRounded /> : <FavoriteBorderRounded />}
        onClick={onLikeClick}
        sx={{
          ...baseButtonSx,
          minWidth: 170,
          width: { sm: 186 },
          color: isLiked ? 'primary.contrastText' : 'text.secondary',
          ...(isLiked
            ? {}
            : {
                '&:hover': {
                  transform: 'translateY(-1px)',
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
              }),
        }}
      >
        Нравится · {likeCount}
      </Button>

      {commentTo === undefined ? (
        <Button
          color="secondary"
          startIcon={<ChatBubbleOutlineRounded />}
          onClick={onCommentClick}
          sx={{
            ...baseButtonSx,
            minWidth: 206,
            width: { sm: 220 },
            color: 'text.secondary',
            '&:hover': {
              transform: 'translateY(-1px)',
              color: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
        >
          Комментарии · {commentCount}
        </Button>
      ) : (
        <Button
          component={RouterLink}
          to={commentTo}
          color="secondary"
          startIcon={<ChatBubbleOutlineRounded />}
          sx={{
            ...baseButtonSx,
            minWidth: 206,
            width: { sm: 220 },
            color: 'text.secondary',
            '&:hover': {
              transform: 'translateY(-1px)',
              color: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
        >
          Комментарии · {commentCount}
        </Button>
      )}
    </Stack>
  )
}
