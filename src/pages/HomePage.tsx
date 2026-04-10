import { Link } from 'react-router-dom'
import kostromaHero from '../assets/kostroma-hero.jpg'
import { formatDate } from '../lib/format'
import { useAppState } from '../state/AppState'

export function HomePage() {
  const { appeals, news, session } = useAppState()
  const featuredNews = news[0]
  const recentNews = news.slice(0, 3)
  const openAppealsCount = appeals.filter(
    (appeal) => (appeal.status === 'Закрыто' ? false : true),
  ).length
  const profileLink = session.role === 'guest' ? '/auth' : '/profile'
  const profileLabel =
    session.role === 'guest' ? 'Войти в кабинет' : 'Открыть профиль'

  if (featuredNews === undefined) {
    return null
  }

  return (
    <>
      <section className="home-hero">
        <img
          className="home-hero__media"
          src={kostromaHero}
          alt="Центральный парк Костромы"
        />
        <div className="home-hero__shade" />
        <div className="content-shell home-hero__content">
          <p className="eyebrow">Молодая Гвардия Костромы</p>
          <h1>Новости, обращения и участие в жизни города в одном спокойном интерфейсе.</h1>
          <p className="lead">
            Следите за инициативами штаба, отправляйте обращения с фото и адресом,
            сохраняйте историю участия в личном кабинете.
          </p>

          <div className="button-row button-row--hero">
            <Link className="button button--primary" to="/appeal/new">
              Создать обращение
            </Link>
            <Link className="button button--secondary" to="/news">
              Читать новости
            </Link>
          </div>

          <ul className="hero-facts" aria-label="Ключевые возможности">
            <li>
              <strong>{news.length}</strong>
              <span>актуальных публикаций</span>
            </li>
            <li>
              <strong>{openAppealsCount}</strong>
              <span>обращений в работе</span>
            </li>
            <li>
              <strong>2 роли</strong>
              <span>пользователь и администратор</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="section-block">
        <div className="content-shell">
          <div className="section-head">
            <p className="eyebrow">Ключевые сценарии</p>
            <h2>Каждый раздел отвечает только за одно действие.</h2>
          </div>

          <div className="feature-rail">
            <article>
              <h3>Новости штаба</h3>
              <p>
                Лента с фотографиями, комментариями и понятной датой публикации без
                лишнего визуального шума.
              </p>
            </article>
            <article>
              <h3>Обращения жителей</h3>
              <p>
                Одна форма с адресом, фото и описанием проблемы. Админ получает ее в
                личном кабинете с уведомлением.
              </p>
            </article>
            <article>
              <h3>Личный кабинет</h3>
              <p>
                Профиль участника, история активности, редактирование информации и
                прозрачные статусы обращений.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-block section-block--contrast">
        <div className="content-shell editorial-grid">
          <div>
            <div className="section-head section-head--compact">
              <p className="eyebrow">Главная новость</p>
              <h2>{featuredNews.title}</h2>
            </div>
            <p className="detail-copy">{featuredNews.summary}</p>
            <p className="meta-line">
              {formatDate(featuredNews.createdAt)} · {featuredNews.author}
            </p>
            <div className="button-row">
              <Link className="button button--secondary" to={`/news/${featuredNews.id}`}>
                Открыть публикацию
              </Link>
              <Link className="button button--ghost" to="/news">
                Открыть полную ленту
              </Link>
            </div>
          </div>

          <div className="news-stack" aria-label="Последние публикации">
            {recentNews.map((item) => (
              <Link
                key={item.id}
                className="news-stack__item news-stack__item--link"
                to={`/news/${item.id}`}
              >
                <div>
                  <p className="meta-line">{item.category}</p>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.summary}</p>
                <span>{formatDate(item.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="content-shell workflow-grid">
          <div>
            <div className="section-head section-head--compact">
              <p className="eyebrow">Как работает обращение</p>
              <h2>Без звонков и потери деталей.</h2>
            </div>
            <ol className="workflow-list">
              <li>Пользователь описывает проблему и прикладывает фото.</li>
              <li>Администратор видит уведомление и принимает обращение в работу.</li>
              <li>В профиле сохраняется статус, чтобы человек видел движение заявки.</li>
            </ol>
          </div>

          <aside className="cta-panel">
            <p className="eyebrow">Личный кабинет</p>
            <h3>Понятная точка входа для участника и администратора.</h3>
            <p>
              Один вход, роли открывают нужные инструменты. Так навигация остается
              простой, а интерфейс не распадается на два разных сайта.
            </p>
            <div className="button-row">
              <Link className="button button--primary" to={profileLink}>
                {profileLabel}
              </Link>
              <Link className="button button--ghost" to="/auth">
                Роли и доступ
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
