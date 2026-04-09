interface NotificationBadgeProps {
  value: number
  label?: string
}

export function NotificationBadge({
  value,
  label = 'Новые уведомления',
}: NotificationBadgeProps) {
  if (value < 1) {
    return null
  }

  return (
    <span className="notification-badge" aria-label={label + ': ' + value}>
      {value > 9 ? '9+' : value}
    </span>
  )
}
