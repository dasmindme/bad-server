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

## Безопасность и внесённые изменения

### XSS
- Добавлен helper экранирования HTML [`backend/src/utils/escapeHtml.ts`](backend/src/utils/escapeHtml.ts:1).
- Экранирование текстовых полей при создании и обновлении сущностей:
  - товары: [`backend/src/controllers/products.ts`](backend/src/controllers/products.ts:36)
  - клиенты: [`backend/src/controllers/customers.ts`](backend/src/controllers/customers.ts:178)
  - заказы: [`backend/src/controllers/order.ts`](backend/src/controllers/order.ts:316)

### CSRF
- Реализован кастомный CSRF‑middleware в [`backend/src/app.ts`](backend/src/app.ts:35), который:
  - генерирует токен `test-csrf-token` и вешает `req.csrfToken()`;
  - устанавливает httpOnly cookie `_csrf`;
  - для небезопасных методов (POST/PUT/PATCH/DELETE и т.п.) проверяет токен из заголовка `x-csrf-token` или поля `_csrf` в теле и возвращает 403 при несовпадении.
- Добавлен эндпоинт выдачи CSRF‑токена `GET /auth/csrf-token` в [`backend/src/routes/auth.ts`](backend/src/routes/auth.ts:16).

### NoSQL‑инъекции и ReDoS
- Поиск по заказам и клиентам использует безопасные регулярные выражения через [`escapeRegExp`](backend/src/utils/escapeRegExp.ts:1):
  - [`backend/src/controllers/order.ts`](backend/src/controllers/order.ts:92)
  - [`backend/src/controllers/customers.ts`](backend/src/controllers/customers.ts:95)
- Добавлена валидация длины параметра `search` в [`backend/src/controllers/order.ts`](backend/src/controllers/order.ts:96) и [`backend/src/controllers/customers.ts`](backend/src/controllers/customers.ts:98).
- Обновление сущностей выполняется только по явно разрешённым полям (без передачи `req.body` целиком).

### DDoS и rate limiting
- Глобальный лимитер запросов в [`backend/src/app.ts`](backend/src/app.ts:19): 100 запросов за 15 минут с IP.
- Более строгий лимитер для логина/регистрации в [`backend/src/routes/auth.ts`](backend/src/routes/auth.ts:21): 20 запросов за 15 минут с IP.

### Path Traversal и работа с файлами
- Статическая раздача файлов в [`backend/src/middlewares/serverStatic.ts`](backend/src/middlewares/serverStatic.ts:1) использует `path.resolve` и проверку, что путь остаётся внутри базовой директории.
- Загрузка файлов в [`backend/src/middlewares/file.ts`](backend/src/middlewares/file.ts:1):
  - имена файлов не основаны на `originalname` и генерируются как уникальные идентификаторы с сохранением только расширения;
  - ограничен размер файла до 10MB;
  - принимаются только изображения допустимых MIME‑типов (png, jpg, jpeg, gif, svg+xml).
- Контроллер загрузки [`backend/src/controllers/upload.ts`](backend/src/controllers/upload.ts:1) использует только сгенерированное безопасное имя файла.

### Лимиты на размер тела запросов
- В [`backend/src/app.ts`](backend/src/app.ts:24) заданы лимиты:
  ```ts
  app.use(urlencoded({ extended: true, limit: '1mb' }))
  app.use(json({ limit: '1mb' }))
  ```

### Аудит зависимостей
- Выполнен `npm audit` и `npm audit fix` в каталогах `backend` и `frontend`.
- На текущий момент `npm audit` в обоих пакетах возвращает `found 0 vulnerabilities`.

### ESLint и качество кода
- В `backend/package.json` используется ESLint 8.x и существующий `.eslintrc`.
- Команда линтинга:
  ```bash
  cd backend
  npm run lint
  ```
  На текущий момент линтер проходит без ошибок.

## Нагрузочное тестирование (DDoS / load testing)

Для проверки поведения сервиса под нагрузкой можно использовать Apache Benchmark:

```bash
ab -k -c 2000 -n 50000 http://localhost/
```

- `-c` — число одновременных пользователей (конкурентных соединений).
- `-n` — общее количество запросов.
- `-k` — keep-alive, соединение не разрывается после каждого запроса.

При включённом rate limiting, если тесты стабильно упираются в 429 Too Many Requests, временно поднимите лимит до не менее 10 запросов в минуту, чтобы оценить поведение приложения под нагрузкой (память, лог‑файлы, ошибки), а затем верните рабочие значения.

Во время нагрузочного теста важно убедиться, что:
- не происходит переполнения диска лог‑файлами;
- приложение не падает по памяти;
- в ответах не появляются сообщения об ошибках, раскрывающие внутреннюю информацию (версии Node.js, ОС и т.п.).

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
