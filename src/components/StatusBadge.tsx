import { Chip } from '@mui/material'
import type { AppealStatus } from '../types'

const colorMap: Record<AppealStatus, { backgroundColor: string, color: string }> = {
  Отправлено: {
    backgroundColor: 'rgba(207, 74, 74, 0.12)',
    color: '#cf4a4a',
  },
  Принято: {
    backgroundColor: 'rgba(117, 85, 44, 0.12)',
    color: '#9f6d2b',
  },
  'В работе': {
    backgroundColor: 'rgba(75, 106, 189, 0.14)',
    color: '#4563a9',
  },
  Закрыто: {
    backgroundColor: 'rgba(55, 126, 88, 0.14)',
    color: '#2d8a5a',
  },
}

interface StatusBadgeProps {
  status: AppealStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const palette = colorMap[status]

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        alignSelf: 'flex-start',
        bgcolor: palette.backgroundColor,
        color: palette.color,
        fontWeight: 800,
      }}
    />
  )
}
