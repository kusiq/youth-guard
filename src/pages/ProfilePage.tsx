import { useEffect, useState, useTransition } from 'react'
import { AccessNotice } from '../components/AccessNotice'
import { StatusBadge } from '../components/StatusBadge'
import { interestOptions } from '../data/mockData'
import { formatDate } from '../lib/format'
import { readFileAsDataUrl } from '../lib/file'
import { useAppState } from '../state/AppState'
import type { UserProfile } from '../types'

export function ProfilePage() {
  const { appeals, isAuthenticated, profile, session, updateProfile } = useAppState()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<UserProfile>(profile)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    setForm(profile)
  }, [profile])

  if (isAuthenticated === false) {
    return (
      <AccessNotice
        title="Профиль доступен после входа."
        description="В кабинете можно редактировать информацию о себе, загружать фото и отслеживать обращения."
        actionLabel="Открыть вход"
        to="/auth"
      />
    )
  }

  const myAppeals = appeals.filter((appeal) => appeal.authorName === session.displayName)

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (file === undefined) {
      return
    }

    const avatar = await readFileAsDataUrl(file)
    setForm((currentForm) => ({
      ...currentForm,
      avatar,
    }))
  }

  function toggleInterest(interest: string) {
    const hasInterest = form.interests.includes(interest)

    setForm((currentForm) => ({
      ...currentForm,
      interests: hasInterest
        ? currentForm.interests.filter((item) => (item === interest ? false : true))
        : [...currentForm.interests, interest],
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(() => {
      updateProfile(form)
      setStatusMessage('Профиль обновлен. Изменения уже видны в шапке и личном кабинете.')
    })
  }

  return (
    <section className="page-shell">
      <div className="content-shell workspace-grid">
        <div>
          <div className="section-head section-head--compact">
            <p className="eyebrow">Профиль</p>
            <h1>Личный кабинет участника с понятной историей активности.</h1>
          </div>
          <p className="lead">
            Здесь можно обновить информацию о себе, загрузить фото и видеть текущий
            статус всех своих обращений без лишних переходов.
          </p>

          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Фото профиля</span>
              <input className="input input--file" type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>

            {form.avatar === undefined ? null : (
              <div className="avatar-preview">
                <img src={form.avatar} alt="Фото профиля" />
              </div>
            )}

            <label className="field">
              <span>Имя</span>
              <input
                className="input"
                type="text"
                value={form.displayName}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    displayName: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    email: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Город</span>
              <input
                className="input"
                type="text"
                value={form.city}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    city: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>Телефон</span>
              <input
                className="input"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    phone: event.target.value,
                  }))
                }
              />
            </label>

            <label className="field">
              <span>О себе</span>
              <textarea
                className="textarea"
                rows={5}
                value={form.bio}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    bio: event.target.value,
                  }))
                }
              />
            </label>

            <fieldset className="field fieldset">
              <legend>Интересы</legend>
              <div className="chip-grid">
                {interestOptions.map((interest) => {
                  const isSelected = form.interests.includes(interest)

                  return (
                    <button
                      key={interest}
                      className={isSelected ? 'chip is-selected' : 'chip'}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <button className="button button--primary" type="submit" disabled={isPending}>
              {isPending ? 'Сохраняем профиль...' : 'Сохранить изменения'}
            </button>

            {statusMessage === '' ? null : (
              <p className="feedback-message">{statusMessage}</p>
            )}
          </form>
        </div>

        <aside className="side-column">
          <section className="summary-panel">
            <p className="eyebrow">Роль</p>
            <h3>{session.displayName}</h3>
            <p>{session.role === 'admin' ? 'Доступ к админским функциям включен.' : 'Обычный пользовательский кабинет.'}</p>
          </section>

          <section className="summary-panel">
            <p className="eyebrow">История обращений</p>
            <div className="status-list">
              {myAppeals.map((appeal) => (
                <article key={appeal.id} className="status-list__item">
                  <div>
                    <h3>{appeal.title}</h3>
                    <p>{appeal.category}</p>
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
