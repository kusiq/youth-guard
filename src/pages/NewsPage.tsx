import { useDeferredValue, useState, useTransition } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { useAppState } from '../state/AppState'

export function NewsPage() {
  const { addComment, isAuthenticated, news } = useAppState()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState('')
  const [commentText, setCommentText] = useState('')
  const [selectedNewsId, setSelectedNewsId] = useState(
    news.length === 0 ? '' : news[0].id,
  )
  const deferredSearch = useDeferredValue(searchValue)
  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filteredNews = news.filter((item) => {
    if (normalizedSearch === '') {
      return true
    }

    const haystack = [item.title, item.summary, item.category].join(' ').toLowerCase()
    return haystack.includes(normalizedSearch)
  })

  if (news.length === 0) {
    return null
  }

  const hasSelectedItem = filteredNews.some((item) => item.id === selectedNewsId)
  const visibleSelectedId = hasSelectedItem
    ? selectedNewsId
    : filteredNews.length === 0
      ? ''
      : filteredNews[0].id
  const selectedNews =
    filteredNews.find((item) => item.id === visibleSelectedId) ??
    (filteredNews.length === 0 ? undefined : filteredNews[0])

  function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (selectedNews === undefined) {
      return
    }

    if (commentText.trim() === '') {
      return
    }

    startTransition(() => {
      addComment(selectedNews.id, commentText)
      setCommentText('')
    })
  }

  return (
    <section className="page-shell">
      <div className="content-shell news-page">
        <div className="section-head section-head--compact">
          <p className="eyebrow">Новости</p>
          <h1>Лента штаба с комментариями и спокойной навигацией по публикациям.</h1>
        </div>

        <label className="field field--search">
          <span>Поиск по новостям</span>
          <input
            className="input"
            type="search"
            value={searchValue}
            placeholder="Например: благоустройство или волонтерство"
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </label>

        <div className="news-workspace">
          <aside className="news-list" aria-label="Список публикаций">
            {filteredNews.map((item) => {
              const isActive = item.id === visibleSelectedId

              return (
                <button
                  key={item.id}
                  className={isActive ? 'news-list__item is-active' : 'news-list__item'}
                  type="button"
                  onClick={() => setSelectedNewsId(item.id)}
                >
                  <p className="meta-line">{item.category}</p>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span>{formatDate(item.createdAt)}</span>
                </button>
              )
            })}
          </aside>

          <article className="article-panel">
            {selectedNews === undefined ? (
              <div className="summary-panel">
                <p className="eyebrow">Ничего не найдено</p>
                <h3>Измените запрос поиска.</h3>
                <p>Попробуйте короче или уберите лишние слова.</p>
              </div>
            ) : (
              <>
                {selectedNews.image === undefined ? null : (
                  <img className="article-panel__image" src={selectedNews.image} alt={selectedNews.title} />
                )}
                <p className="meta-line">
                  {selectedNews.category} · {formatDate(selectedNews.createdAt)}
                </p>
                <h2>{selectedNews.title}</h2>
                <p className="detail-copy">{selectedNews.summary}</p>

                <div className="article-panel__body">
                  {selectedNews.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <section className="comments-section">
                  <div className="section-head section-head--compact">
                    <p className="eyebrow">Комментарии</p>
                    <h3>{selectedNews.comments.length} сообщений</h3>
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
                          rows={4}
                          value={commentText}
                          onChange={(event) => setCommentText(event.target.value)}
                        />
                      </label>
                      <button className="button button--primary" type="submit" disabled={isPending}>
                        {isPending ? 'Публикуем...' : 'Опубликовать комментарий'}
                      </button>
                    </form>
                  ) : (
                    <div className="summary-panel summary-panel--inline">
                      <p>Чтобы комментировать новости, откройте личный кабинет.</p>
                      <Link className="button button--ghost" to="/auth">
                        Перейти ко входу
                      </Link>
                    </div>
                  )}
                </section>
              </>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
