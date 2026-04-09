import { Link } from 'react-router-dom'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="content-shell site-footer__inner">
        <div>
          <p className="site-footer__brand">Молодая Гвардия Костромы</p>
          <p className="site-footer__text">
            Прототип городского сайта с новостями, обращениями жителей и личным кабинетом.
          </p>
        </div>

        <div className="site-footer__nav" aria-label="Нижняя навигация">
          <Link to="/news">Новости</Link>
          <Link to="/appeal/new">Обращение</Link>
          <Link to="/auth">Вход</Link>
        </div>

        <p className="site-footer__credit">
          Фото hero:{' '}
          <a
            href="https://commons.wikimedia.org/wiki/File:Kostroma_-_Central_park_-_2024-05_-_p2.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Александр Сигачёв / Wikimedia Commons
          </a>
        </p>
      </div>
    </footer>
  )
}
