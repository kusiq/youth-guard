# Youth Guard

Городская лента, обращения жителей и рабочий кабинет штаба на `React + Vite + MUI`.

Теперь в репозитории есть не только клиент, но и стартовая серверная база:

- локальный API на `Express`
- `SQLite`-хранилище в `data/youth-guard.db`
- роли `user/admin` с серверной сессией через cookie
- seed новостей, комментариев, обращений и demo-аккаунтов
- ручное создание администраторов через CLI

## Запуск

```bash
npm install
npm run dev
```

`npm run dev` поднимает сразу:

- frontend на `http://localhost:5174`
- backend на `http://127.0.0.1:8787`

Vite уже проксирует `/api` на локальный backend.

## Demo-аккаунты

```text
Администратор:
admin@kostroma-demo.ru
demo-password

Пользователь:
alexey@kostroma-demo.ru
demo-password
```

## Создание администратора

```bash
npm run admin:create -- \
  --email curator@kostroma-demo.ru \
  --password strong-password-123 \
  --display-name "Куратор штаба"
```

Скрипт создаёт администратора прямо в локальной базе данных.

## Что уже переведено на сервер

- вход и регистрация
- серверные роли без клиентского выбора `admin`
- bootstrap состояния приложения через `/api/app/state`
- новости, лайки, комментарии
- профиль пользователя
- обращения и смена статусов

## Что дальше перед настоящим деплоем

1. Вынести SQLite на внешний persistent-store или managed SQL.
2. Добавить UI для управления администраторами из админки.
3. Разделить frontend-deploy и backend-deploy по выбранной платформе.
4. Перенести секреты и cookie-параметры в env-конфиг для production.
