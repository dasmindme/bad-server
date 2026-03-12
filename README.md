# Проектная работа "WebLarek. Плохой сервер.", спринт 17

## Информация о проекте
- Репозиторий: 'https://github.com/dasmindme/bad-server'
- Автор: Ирина Власова, 39 когорта, fullstack расширенный

## Подготовка к работе
1. Склонировать репозиторий.
2. Запустить Docker и поднять сервисы:
   ```bash
   docker compose up -d
   ```
3. Наполнить базу данных (см. [` .dump/README.md`](.dump/README.md:1)).
4. Перейти по адресу `http://localhost/` — на странице должны быть продукты.
5. Страница авторизации: `http://localhost/login/`.
6. Админка: `http://localhost/admin/`.

## Полезные команды

### Backend
```bash
cd backend
npm install        # установка зависимостей
npm run dev        # запуск в режиме разработки
npm run build      # сборка TypeScript
npm run lint       # проверка ESLint
npm audit          # аудит зависимостей
```

### Запуск всего проекта
```bash
# из корня репозитория
docker compose up -d
```
