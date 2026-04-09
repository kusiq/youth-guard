import { useState, useTransition } from 'react'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { appealCategories } from '../data/mockData'
import { formatDate } from '../lib/format'
import { readFileAsDataUrl } from '../lib/file'
import { useAppState } from '../state/AppState'

export function AppealPage() {
  const { appeals, createAppeal, isAuthenticated, session } = useAppState()
  const [isPending, startTransition] = useTransition()
  const [successMessage, setSuccessMessage] = useState('')
  const [form, setForm] = useState({
    title: 'Проблема во дворе',
    category: appealCategories[0],
    address: 'Кострома, ул. Советская, 27',
    text: 'Опишите ситуацию, приложите фото и дайте короткий контекст: когда заметили проблему и что уже предпринимали.',
    image: '',
  })

  if (isAuthenticated === false) {
    return (
      <AccessNotice
        title="Для отправки обращения нужен личный кабинет."
        description="После входа можно прикрепить фото, указать адрес и отслеживать статус обращения в профиле."
        actionLabel="Войти или зарегистрироваться"
        to="/auth"
      />
    )
  }

  const myAppeals = appeals
    .filter((appeal) => appeal.authorName === session.displayName)
    .slice(0, 3)

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    const image = await readFileAsDataUrl(file)
    setForm((currentForm) => ({
      ...currentForm,
      image,
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      createAppeal({
        title: form.title,
        category: form.category,
        address: form.address,
        text: form.text,
        image: form.image || undefined,
      })

      setSuccessMessage('Обращение отправлено. Администратор увидит его в личном кабинете с уведомлением.')
      setForm((currentForm) => ({
        ...currentForm,
        title: '',
        address: '',
        text: '',
        image: '',
      }))
    })
  }

  return (
    <section className="page-shell">
      <div className="content-shell workspace-grid">
        <div>
          <div className="section-head section-head--compact">
            <p className="eyebrow">Обращение</p>
            <h1>Оставьте проблему так, чтобы ее можно было быстро взять в работу.</h1>
          </div>
          <p className="lead">
            Укажите адрес, коротко опишите ситуацию и приложите фото. Форма сделана
            так, чтобы администратор увидел задачу без лишних уточнений.
          </p>

          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Заголовок</span>
              <input
                className="input"
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    title: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Категория</span>
              <select
                className="select"
                value={form.category}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    category: event.target.value,
                  }))
                }
              >
                {appealCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Адрес</span>
              <input
                className="input"
                type="text"
                value={form.address}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    address: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Описание</span>
              <textarea
                className="textarea"
                rows={6}
                value={form.text}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    text: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Фото</span>
              <input className="input input--file" type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {form.image === '' ? null : (
              <div className="image-preview">
                <img src={form.image} alt="Предпросмотр обращения" />
              </div>
            )}

            <button className="button button--primary" type="submit" disabled={isPending}>
              {isPending ? 'Отправляем обращение...' : 'Отправить обращение'}
            </button>

            {successMessage === '' ? null : (
              <p className="feedback-message">{successMessage}</p>
            )}
          </form>
        </div>

        <aside className="side-column">
          <section className="summary-panel">
            <p className="eyebrow">Подсказка</p>
            <h3>Что помогает обработать обращение быстрее</h3>
            <ul className="workflow-list workflow-list--compact">
              <li>Точный адрес или привязка к понятному ориентиру.</li>
              <li>Фото с текущим состоянием места.</li>
              <li>Короткий текст без лишнего общего фона.</li>
            </ul>
          </section>

          <section className="summary-panel">
            <p className="eyebrow">Мои обращения</p>
            <div className="status-list">
              {myAppeals.map((appeal) => (
                <article key={appeal.id} className="status-list__item">
                  <div>
                    <h3>{appeal.title}</h3>
                    <p>{appeal.address}</p>
                  </div>
                  <StatusBadge status={appeal.status} />
                  <span>{formatDate(appeal.createdAt)}</span>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  )
}
