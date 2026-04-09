import { Link } from 'react-router-dom'

interface AccessNoticeProps {
  title: string
  description: string
  actionLabel: string
  to: string
}

export function AccessNotice({
  title,
  description,
  actionLabel,
  to,
}: AccessNoticeProps) {
  return (
    <section className="access-notice content-shell">
      <p className="eyebrow">Нужен доступ</p>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
      <div className="button-row">
        <Link className="button button--primary" to={to}>
          {actionLabel}
        </Link>
        <Link className="button button--secondary" to="/news">
          Вернуться к новостям
        </Link>
      </div>
    </section>
  )
}
