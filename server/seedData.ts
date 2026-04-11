import type { AccountRole, AppealStatus } from '../src/types'

export interface SeedUser {
  id: string
  email: string
  password: string
  role: AccountRole
  displayName: string
  city: string
  phone: string
  bio: string
  interests: string[]
  avatar?: string
}

export interface SeedComment {
  id: string
  authorEmail?: string
  authorName: string
  role: AccountRole
  text: string
  createdAt: string
  avatar?: string
}

export interface SeedNewsItem {
  id: string
  title: string
  summary: string
  body: string[]
  category: string
  createdAt: string
  authorName: string
  image?: string
  likes: number
  comments: SeedComment[]
}

export interface SeedAppeal {
  id: string
  title: string
  category: string
  address: string
  text: string
  createdAt: string
  status: AppealStatus
  authorEmail: string
  viewedByAdmin: boolean
  image?: string
}

export const seedUsers: SeedUser[] = [
  {
    id: 'user-alexey',
    email: 'alexey@kostroma-demo.ru',
    password: 'demo-password',
    role: 'user',
    displayName: 'Алексей Смирнов',
    city: 'Кострома',
    phone: '+7 (910) 000-00-00',
    bio: 'Участвую в городских инициативах, волонтерских акциях и молодежных событиях района.',
    interests: ['Волонтерство', 'Медиа', 'Экология', 'Городские инициативы', 'Работа с обращениями'],
  },
  {
    id: 'user-elena',
    email: 'elena@kostroma-demo.ru',
    password: 'demo-password',
    role: 'user',
    displayName: 'Елена Воронцова',
    city: 'Кострома',
    phone: '+7 (920) 100-10-10',
    bio: 'Помогаю с дворовыми инициативами и районными проектами в Давыдовском.',
    interests: ['Благоустройство дворов', 'Волонтерство', 'Урбанистика'],
  },
  {
    id: 'admin-coordinator',
    email: 'admin@kostroma-demo.ru',
    password: 'demo-password',
    role: 'admin',
    displayName: 'Координатор штаба',
    city: 'Кострома',
    phone: '+7 (910) 222-22-22',
    bio: 'Координирую обращения, новости и рабочие процессы штаба.',
    interests: ['Работа с обращениями', 'Организация мероприятий', 'Городские инициативы'],
  },
]

export const seedNews: SeedNewsItem[] = [
  {
    id: 'news-park',
    title: 'Весенний штабной день в Центральном парке',
    summary:
      'Команда собрала участников, волонтеров и жителей на спокойный городской субботник с открытым диалогом.',
    body: [
      'Утро началось с быстрой координации волонтеров, распределения зон уборки и короткого брифинга по безопасности. К обеду команда уже привела в порядок дорожки, клумбы и прилегающую территорию.',
      'После работ мы оставили площадку не просто чистой, а живой: организовали точку обратной связи, собрали предложения по благоустройству и записали несколько новых обращений прямо на месте.',
      'Такие события важны не только как акция помощи, но и как способ держать городской разговор открытым и понятным для всех.',
    ],
    category: 'События',
    createdAt: '2026-04-06T09:00:00.000Z',
    authorName: 'Штаб Молодой Гвардии',
    image: '/images/kostroma-hero.jpg',
    likes: 26,
    comments: [
      {
        id: 'comment-park-1',
        authorName: 'Мария Егорова',
        role: 'user',
        text: 'Спасибо за нормальную организацию, очень спокойно и без лишнего шума.',
        createdAt: '2026-04-06T11:30:00.000Z',
      },
      {
        id: 'comment-park-2',
        authorEmail: 'admin@kostroma-demo.ru',
        authorName: 'Координатор штаба',
        role: 'admin',
        text: 'Спасибо, в следующий раз добавим еще точку регистрации на входе.',
        createdAt: '2026-04-06T13:10:00.000Z',
      },
    ],
  },
  {
    id: 'news-hotline',
    title: 'Открыли единый поток обращений по районам Костромы',
    summary:
      'Теперь обращения по благоустройству, освещению и дворовым проблемам можно оставить в одном интерфейсе без лишних звонков.',
    body: [
      'Мы собрали единый сценарий для обращений, чтобы жителям было проще описывать проблему, добавлять фото и указывать точный адрес.',
      'Для штаба это значит более понятную сортировку, заметные уведомления и меньше потерянных запросов.',
    ],
    category: 'Городская среда',
    createdAt: '2026-04-02T14:00:00.000Z',
    authorName: 'Цифровая команда',
    likes: 14,
    comments: [
      {
        id: 'comment-hotline-1',
        authorName: 'Ирина Плотникова',
        role: 'user',
        text: 'Очень не хватало именно адреса и фото в одной форме.',
        createdAt: '2026-04-03T08:20:00.000Z',
      },
    ],
  },
  {
    id: 'news-media',
    title: 'Молодежная медиакоманда запустила новую рубрику о локальных инициативах',
    summary:
      'Каждую неделю будем показывать небольшие, но реальные городские истории: от школьных проектов до дворовых инициатив.',
    body: [
      'Новая рубрика нужна, чтобы местные инициативы не терялись в шуме. Мы делаем короткие, ясные публикации и сразу добавляем способы включиться в работу.',
      'В центре внимания будут реальные люди, понятные задачи и аккуратная подача без формального канцелярита.',
    ],
    category: 'Волонтерство',
    createdAt: '2026-03-28T10:15:00.000Z',
    authorName: 'Медиацентр',
    likes: 9,
    comments: [],
  },
]

export const seedAppeals: SeedAppeal[] = [
  {
    id: 'appeal-light',
    title: 'Освещение у школьного стадиона',
    category: 'Благоустройство',
    address: 'Кострома, ул. Никитская, 12',
    text: 'После 20:00 участок возле стадиона почти полностью темный. Нужна проверка освещения и состояния опор.',
    createdAt: '2026-04-05T18:30:00.000Z',
    status: 'В работе',
    authorEmail: 'alexey@kostroma-demo.ru',
    viewedByAdmin: false,
  },
  {
    id: 'appeal-yard',
    title: 'Нужна уборка и вывоз веток во дворе',
    category: 'Благоустройство',
    address: 'Кострома, мкр. Давыдовский-2, 19',
    text: 'После обрезки деревьев ветки сложили возле парковки и не вывезли уже несколько дней.',
    createdAt: '2026-04-01T08:00:00.000Z',
    status: 'Принято',
    authorEmail: 'elena@kostroma-demo.ru',
    viewedByAdmin: true,
  },
]
