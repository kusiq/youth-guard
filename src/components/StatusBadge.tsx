import type { AppealStatus } from '../types'

const classNames: Record<AppealStatus, string> = {
  Отправлено: 'status-badge status-badge--queued',
  Принято: 'status-badge status-badge--accepted',
  'В работе': 'status-badge status-badge--progress',
  Закрыто: 'status-badge status-badge--closed',
}

interface StatusBadgeProps {
  status: AppealStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={classNames[status]}>{status}</span>
}
