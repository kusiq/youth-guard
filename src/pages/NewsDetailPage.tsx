import { useState, useTransition } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { useAppState } from '../state/AppState'

export function NewsDetailPage() {
  const { newsId } = useParams()
  const { addComment, isAuthenticated, news } = useAppState()
  const [commentText, setCommentText] = useState('')
  const [isPending, startTransition] = useTransition()
  const selectedNews = news.find((item) => item.id === newsId)
  const moreNews = news.filter((item) => item.id !== newsId).slice(0, 2)

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
      <section className="page-shell">
        <div className="content-shell news-detail-page">
          <Link className="news-detail__back" to="/news">
            Назад к ленте
          </Link>

          <div className="summary-panel">
            <p className="eyebrow">Публикация не найдена</p>
            <h2>Эта новость уже недоступна или ссылка устарела.</h2>
            <p>Откройте общую ленту и выберите публикацию из актуального списка.</p>
            <div className="button-row">
              <Link className="button button--primary" to="/news">
                Открыть ленту
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-shell">
      <div className="content-shell news-detail-page">
        <Link className="news-detail__back" to="/news">
          Назад к ленте
        </Link>

        <article className="news-detail">
          <header className="news-detail__header">
            <p className="eyebrow">Публикация</p>
            <div className="news-detail__meta">
              <span className="meta-line">{selectedNews.category}</span>
              <span className="news-feed__divider" aria-hidden="true">
                •
              </span>
              <span className="meta-line">{formatDate(selectedNews.createdAt)}</span>
              <span className="news-feed__divider" aria-hidden="true">
                •
              </span>
              <span className="meta-line">{selectedNews.author}</span>
            </div>
            <h1 className="news-detail__title">{selectedNews.title}</h1>
            <p className="lead news-detail__lead">{selectedNews.summary}</p>
          </header>

          {selectedNews.image === undefined ? null : (
            <img
              className="news-detail__image"
              src={selectedNews.image}
              alt={selectedNews.title}
            />
          )}

          <div className="news-detail__body">
            {selectedNews.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>

        <section className="comments-section news-detail__comments">
          <div className="section-head section-head--compact">
            <p className="eyebrow">Комментарии</p>
            <h2>{selectedNews.comments.length} сообщений</h2>
          </div>

          <div className="comment-list">
            {selectedNews.comments.map((comment) => (
              <article key={comment.id} className="comment-item">
                <div>
                  <strong>{comment.author}</strong>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
                <p>{comment.text}</p>
              </article>
            ))}
          </div>

          {isAuthenticated ? (
            <form className="form-stack form-stack--compact" onSubmit={handleCommentSubmit}>
              <label className="field">
                <span>Добавить комментарий</span>
                <textarea
                  className="textarea"
                  name="news-comment"
                  rows={4}
                  value={commentText}
                  placeholder="Поделитесь мнением о публикации…"
                  onChange={(event) => setCommentText(event.target.value)}
                />
              </label>
              <button className="button button--primary" type="submit" disabled={isPending}>
                {isPending ? 'Публикуем...' : 'Опубликовать комментарий'}
              </button>
            </form>
          ) : (
            <div className="summary-panel summary-panel--inline summary-panel--cta">
              <p className="summary-panel__copy">
                Чтобы комментировать публикации, откройте личный кабинет.
              </p>
              <Link className="button button--ghost" to="/auth">
                Перейти ко входу
              </Link>
            </div>
          )}
        </section>

        {moreNews.length === 0 ? null : (
          <section className="news-detail__more">
            <div className="section-head section-head--compact">
              <p className="eyebrow">Еще в ленте</p>
              <h2>Другие публикации штаба</h2>
            </div>

            <div className="news-detail__more-list">
              {moreNews.map((item) => (
                <Link key={item.id} className="news-detail__more-link" to={`/news/${item.id}`}>
                  <p className="meta-line">
                    {item.category} · {formatDate(item.createdAt)}
                  </p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  )
}
