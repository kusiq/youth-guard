import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/format'
import { useAppState } from '../state/AppState'

export function NewsPage() {
  const { news } = useAppState()
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

  if (news.length === 0) {
    return null
  }

  return (
    <section className="page-shell">
      <div className="content-shell news-feed-page">
        <div className="news-feed-page__intro">
          <p className="eyebrow">Новости</p>
          <h1 className="news-feed-page__title">Лента штаба</h1>
          <p className="lead news-feed-page__lead">
            Список публикаций работает как спокойный feed: сначала короткая выжимка,
            потом отдельная страница новости с полным текстом и комментариями.
          </p>
        </div>

        <div className="news-feed-page__toolbar">
          <label className="field field--search">
            <span>Поиск по новостям</span>
            <input
              className="input"
              type="search"
              name="news-search"
              value={searchValue}
              autoComplete="off"
              placeholder="Например: благоустройство или волонтерство…"
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </label>
          <p className="meta-line news-feed-page__count">
            Найдено {filteredNews.length} публикаций
          </p>
        </div>

        {filteredNews.length === 0 ? (
          <div className="summary-panel">
            <p className="eyebrow">Ничего не найдено</p>
            <h2>Попробуйте изменить запрос.</h2>
            <p>Уберите лишние слова или ищите по более короткой формулировке.</p>
          </div>
        ) : (
          <div className="news-feed" aria-label="Список публикаций">
            {filteredNews.map((item) => {
              const linkClassName =
                item.image === undefined
                  ? 'news-feed__link news-feed__link--text-only'
                  : 'news-feed__link'

              return (
                <article key={item.id} className="news-feed__item">
                  <Link className={linkClassName} to={`/news/${item.id}`}>
                    <div className="news-feed__copy">
                      <div className="news-feed__meta">
                        <p className="meta-line">{item.category}</p>
                        <span className="news-feed__divider" aria-hidden="true">
                          •
                        </span>
                        <p className="meta-line">{formatDate(item.createdAt)}</p>
                      </div>

                      <h2 className="news-feed__headline">{item.title}</h2>
                      <p className="news-feed__summary">{item.summary}</p>

                      <div className="news-feed__footer">
                        <span className="meta-line">{item.author}</span>
                        <span className="news-feed__divider" aria-hidden="true">
                          •
                        </span>
                        <span className="meta-line">
                          {item.comments.length} комментариев
                        </span>
                      </div>
                    </div>

                    {item.image === undefined ? null : (
                      <img
                        className="news-feed__image"
                        src={item.image}
                        alt={item.title}
                        loading="lazy"
                      />
                    )}
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
