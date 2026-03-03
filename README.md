# Проектная работа "WebLarek. Плохой сервер.", спринт 17

## Информация о проекте
- Репозиторий: 'https://github.com/dasmindme/bad-server'
- Автор: Ирина Власова, 39 когорта, fullsteck расширенный

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
  - заказы: [`backend/src/controllers/order.ts`](backend/src/controllers/order.ts:287)

### CSRF
- Подключён `csurf` и глобальный middleware в [`backend/src/app.ts`](backend/src/app.ts:1).
- Добавлен эндпоинт выдачи CSRF‑токена `GET /auth/csrf-token` в [`backend/src/routes/auth.ts`](backend/src/routes/auth.ts:1).
- Все state‑changing запросы (включая логин/регистрацию) проходят через CSRF‑проверку.

### NoSQL‑инъекции и ReDoS
- Поиск по заказам и клиентам использует безопасные регулярные выражения через [`escapeRegExp`](backend/src/utils/escapeRegExp.ts:1):
  - [`backend/src/controllers/order.ts`](backend/src/controllers/order.ts:92)
  - [`backend/src/controllers/customers.ts`](backend/src/controllers/customers.ts:95)
- Добавлена валидация длины параметра `search` в [`backend/src/middlewares/validations.ts`](backend/src/middlewares/validations.ts:136).
- Обновление сущностей выполняется только по явно разрешённым полям (без передачи `req.body` целиком).

### DDoS и rate limiting
- Глобальный лимитер запросов в [`backend/src/app.ts`](backend/src/app.ts:16): 100 запросов за 15 минут с IP.
- Более строгий лимитер для логина/регистрации в [`backend/src/routes/auth.ts`](backend/src/routes/auth.ts:1): 20 запросов за 15 минут с IP.

### Path Traversal и работа с файлами
- Статическая раздача файлов в [`backend/src/middlewares/serverStatic.ts`](backend/src/middlewares/serverStatic.ts:1) использует `path.resolve` и проверку, что путь остаётся внутри базовой директории.
- Загрузка файлов в [`backend/src/middlewares/file.ts`](backend/src/middlewares/file.ts:1):
  - нормализуются имена файлов (исключены `..`, слэши и опасные символы);
  - ограничен размер файла до 5MB.
- Контроллер загрузки [`backend/src/controllers/upload.ts`](backend/src/controllers/upload.ts:1) использует только нормализованное имя файла.

### Лимиты на размер тела запросов
- В [`backend/src/app.ts`](backend/src/app.ts:24) заданы лимиты:
  ```ts
  app.use(urlencoded({ extended: true, limit: '1mb' }))
  app.use(json({ limit: '1mb' }))
  ```

### Аудит зависимостей
- Выполнен `npm audit --production` и `npm audit fix` в каталоге `backend`.
- Остались 2 low‑severity уязвимости в транзитивной зависимости `cookie` (через `csurf`), которые требуют `npm audit fix --force` с обновлением `csurf` до версии 1.2.2 (breaking change). Решено оставить текущую версию `csurf@1.11.0` и зафиксировать это в README.

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
