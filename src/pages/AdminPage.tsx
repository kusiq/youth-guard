import { useDeferredValue, useEffect, useRef, useState, useTransition } from 'react'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { appealStatuses, newsCategories } from '../data/mockData'
import { formatDate } from '../lib/format'
import { readFileAsDataUrl } from '../lib/file'
import { useAppState } from '../state/AppState'

export function AdminPage() {
  const {
    appeals,
    markAppealsSeen,
    news,
    publishNews,
    session,
    unreadAppealCount,
    updateAppealStatus,
  } = useAppState()
  const [isPending, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState('Все')
  const [searchValue, setSearchValue] = useState('')
  const [newsForm, setNewsForm] = useState({
    title: 'Новая публикация штаба',
    summary: 'Короткая выжимка для ленты, чтобы новость читалась за несколько секунд.',
    category: newsCategories[0],
    body: 'Первый абзац новости.\n\nВторой абзац с деталями, фактами и следующими шагами.',
    image: '',
  })
  const deferredSearch = useDeferredValue(searchValue)
  const hasMarkedInbox = useRef(false)

  useEffect(() => {
    if (hasMarkedInbox.current === false) {
      markAppealsSeen()
      hasMarkedInbox.current = true
    }
  }, [markAppealsSeen])

  if (session.role === 'admin' ? false : true) {
    return (
      <AccessNotice
        title="Админ-панель доступна только координатору."
        description="Обычный пользователь может читать новости, оставлять обращения и вести профиль, но не управлять входящими задачами."
        actionLabel="Войти как администратор"
        to="/auth"
      />
    )
  }

  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filteredAppeals = appeals.filter((appeal) => {
    const matchesStatus = statusFilter === 'Все' ? true : appeal.status === statusFilter

    if (matchesStatus === false) {
      return false
    }

    if (normalizedSearch === '') {
      return true
    }

    const haystack = [appeal.title, appeal.address, appeal.authorName]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedSearch)
  })

  const activeAppealCount = appeals.filter(
    (appeal) => (appeal.status === 'Закрыто' ? false : true),
  ).length

  async function handleNewsImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    const image = await readFileAsDataUrl(file)
    setNewsForm((currentForm) => ({
      ...currentForm,
      image,
    }))
  }

  function handleNewsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      publishNews({
        title: newsForm.title,
        summary: newsForm.summary,
        category: newsForm.category,
        body: newsForm.body
          .split('\n\n')
          .map((part) => part.trim())
          .filter((part) => part.length > 0),
        image: newsForm.image || undefined,
      })

      setNewsForm((currentForm) => ({
        ...currentForm,
        title: '',
        summary: '',
        body: '',
        image: '',
      }))
    })
  }

  return (
    <section className="page-shell page-shell--admin">
      <div className="content-shell admin-grid">
        <div>
          <div className="section-head section-head--compact">
            <p className="eyebrow">Админка</p>
            <h1>Входящие обращения, статусы и публикация новостей.</h1>
          </div>

          <div className="stats-strip">
            <div>
              <strong>{activeAppealCount}</strong>
              <span>обращений в работе</span>
            </div>
            <div>
              <strong>{unreadAppealCount}</strong>
              <span>новых уведомлений</span>
            </div>
            <div>
              <strong>{news.length}</strong>
              <span>всего публикаций</span>
            </div>
          </div>

          <div className="toolbar-row">
            <label className="field field--search">
              <span>Поиск по обращениям</span>
              <input
                className="input"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Статус</span>
              <select
                className="select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="Все">Все</option>
                {appealStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <section className="summary-panel summary-panel--roomy">
            <div className="section-head section-head--compact">
              <p className="eyebrow">Входящие обращения</p>
              <h3>{filteredAppeals.length} элементов</h3>
            </div>

            <div className="status-list status-list--wide">
              {filteredAppeals.map((appeal) => (
                <article key={appeal.id} className="status-list__item status-list__item--admin">
                  <div>
                    <p className="meta-line">{appeal.authorName}</p>
                    <h3>{appeal.title}</h3>
                    <p>{appeal.address}</p>
                    <p>{appeal.text}</p>
                  </div>

                  <div className="status-list__controls">
                    <StatusBadge status={appeal.status} />
                    <select
                      className="select"
                      value={appeal.status}
                      onChange={(event) =>
                        updateAppealStatus(appeal.id, event.target.value as typeof appeal.status)
                      }
                    >
                      {appealStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <span>{formatDate(appeal.createdAt)}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="side-column">
          <section className="summary-panel summary-panel--roomy">
            <div className="section-head section-head--compact">
              <p className="eyebrow">Новая публикация</p>
              <h3>Добавить новость</h3>
            </div>

            <form className="form-stack" onSubmit={handleNewsSubmit}>
              <label className="field">
                <span>Заголовок</span>
                <input
                  className="input"
                  type="text"
                  value={newsForm.title}
                  onChange={(event) =>
                    setNewsForm((currentForm) => ({
                      ...currentForm,
                      title: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Короткое описание</span>
                <textarea
                  className="textarea"
                  rows={3}
                  value={newsForm.summary}
                  onChange={(event) =>
                    setNewsForm((currentForm) => ({
                      ...currentForm,
                      summary: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Раздел</span>
                <select
                  className="select"
                  value={newsForm.category}
                  onChange={(event) =>
                    setNewsForm((currentForm) => ({
                      ...currentForm,
                      category: event.target.value,
                    }))
                  }
                >
                  {newsCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Полный текст</span>
                <textarea
                  className="textarea"
                  rows={6}
                  value={newsForm.body}
                  onChange={(event) =>
                    setNewsForm((currentForm) => ({
                      ...currentForm,
                      body: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Фото</span>
                <input className="input input--file" type="file" accept="image/*" onChange={handleNewsImageChange} />
              </label>

              {newsForm.image === '' ? null : (
                <div className="image-preview image-preview--compact">
                  <img src={newsForm.image} alt="Предпросмотр новости" />
                </div>
              )}

              <button className="button button--primary" type="submit" disabled={isPending}>
                {isPending ? 'Публикуем...' : 'Опубликовать новость'}
              </button>
            </form>
          </section>
        </aside>
      </div>
    </section>
  )
}
