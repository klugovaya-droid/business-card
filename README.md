# Digital Business Card — backend

[![CI](https://github.com/klugovaya-droid/business-card/actions/workflows/ci.yml/badge.svg)](https://github.com/klugovaya-droid/business-card/actions/workflows/ci.yml)

Backend-приложение «цифровая визитка» на NestJS, Prisma, PostgreSQL и GraphQL. Отдаёт профиль, навыки, опыт работы с достижениями и проекты; в браузере доступен Apollo Sandbox. Запускается с нуля одной командой, сам применяет миграции и заполняет базу.

## Ссылки

- Исходный код: <https://github.com/klugovaya-droid/business-card>
- Живое приложение: <https://business-card-test-xenialugovayas-projects.vercel.app>
- Apollo Sandbox: <https://business-card-test-xenialugovayas-projects.vercel.app/graphql>

## Стек

| Компонент | Версия | Зачем |
| --- | --- | --- |
| Node.js | 22 LTS | runtime в Docker и Vercel; локально >= 22.12 |
| TypeScript | 6.0 | strict-режим |
| NestJS | 12.3 | модульная архитектура, DI |
| GraphQL | 16.14 | code-first, Apollo Sandbox |
| Apollo Server | 5.5 | GraphQL-сервер; требует GraphQL 16 |
| Prisma | 7.10 | ORM, миграции, типобезопасный клиент |
| PostgreSQL | 16 | основная БД |
| DataLoader | 2.2 | батчинг вложенных выборок |
| Vitest | 5.1 | unit и e2e |
| Testcontainers | 12.2 | реальный PostgreSQL в e2e |
| Docker / Compose | — | запуск с нуля и деплой |

## Быстрый старт

```bash
docker compose up --build
```

После старта:

- Apollo Sandbox: <http://localhost:3000/graphql>
- Healthcheck: <http://localhost:3000/health>

Если порт 3000 занят:

```bash
APP_PORT=3010 docker compose up --build
# Sandbox: http://localhost:3010/graphql
```

Compose поднимает PostgreSQL 16, ждёт его готовности, применяет миграции в entrypoint контейнера и запускает приложение. Приложение при bootstrap идемпотентно заполняет БД данными из `src/database/seed-data.ts`. Повторный запуск не создаёт дублей.

Полная проверка Docker-сценария:

```bash
APP_PORT=3010 npm run smoke:docker
```

Скрипт собирает образ, поднимает compose, ждёт `/health`, выполняет вложенный GraphQL-запрос и гасит окружение.

## Локальная разработка

Нужен PostgreSQL 16. Например:

```bash
docker run --rm -d --name business-card-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=business_card \
  -p 5432:5432 \
  postgres:16-alpine
```

Затем:

```bash
cp .env.example .env
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run start:dev
```

`npm run start:dev` поднимет приложение на `http://localhost:3000/graphql`; при bootstrap выполнятся идемпотентные сиды. Для отдельного запуска сидов есть `npm run seed`.

Если локальный порт 5432 занят, используйте другой порт в `docker run` и соответствующий `DATABASE_URL` в `.env`.

## GraphQL API

### Запрос из тестового задания

```graphql
query {
  profile {
    name
    description
    skills {
      name
    }
    experience {
      company
      position
    }
    projects {
      name
    }
  }
}
```

### Расширенный запрос

```graphql
query {
  profile {
    id
    name
    title
    description
    email
    location
    githubUrl
    linkedinUrl
    skills {
      name
      category
      level
    }
    experience {
      company
      position
      startDate
      endDate
      achievements {
        text
      }
    }
    projects {
      name
      description
      url
      repositoryUrl
      technologies
    }
  }
}
```

Схема — code-first (`src/**/*.types.ts`), сгенерированная версия лежит в [`src/schema.gql`](src/schema.gql).

## Архитектура

### Слои и поток запроса

```text
Apollo Sandbox / HTTP client
            │
            ▼
GraphQL resolver (transport)
            │
            ▼
Service (бизнес-логика)
            │
            ├── DataLoader (батчинг вложенных связей)
            │
            ▼
PrismaService (доступ к данным)
            │
            ▼
PostgreSQL
```

- Резолверы только принимают аргументы и делегируют в сервисы или loader-ы.
- Сервисы содержат бизнес-логику и запросы к Prisma; о GraphQL-типах не знают.
- PrismaService инкапсулирует подключение и lifecycle.
- Feature-модули: `profile`, `skill`, `experience`, `project`; инфраструктура — `prisma`, `config`, `database`, `common`, `health`.

### Почему code-first

Типы описываются декораторами рядом с TypeScript-классами. Нет дублирования схемы и DTO, работает автодополнение, а `src/schema.gql` всегда соответствует коду. Для небольшого API это дешевле и надёжнее schema-first.

### DataLoader и отсутствие N+1

Вложенные поля резолвятся через request-scoped `ProfileLoaders`:

- `Profile.skills`, `Profile.projects`, `Profile.experience` — батчинг по `profileId`;
- `Experience.achievements` — батчинг по `experienceId`.

Один GraphQL-запрос создаёт новый экземпляр loader-ов, поэтому кеш не переносится между запросами. Внутри запроса DataLoader собирает ключи и выполняет один `findMany` с `IN (...)` вместо запроса на каждый родительский объект.

Отсутствие N+1 доказывается e2e-тестом:

1. В сидах два опыта работы с достижениями.
2. Тест подписывается на события `query` Prisma и очищает счётчик.
3. Выполняется запрос `profile { experience { achievements { text } } }`.
4. Тест проверяет, что SQL-запросов к `Achievement` ровно один, а достижения вернулись для всех опытов.

Юнит-тесты отдельно проверяют батчинг, группировку, дедупликацию ключей, пустые коллекции и изоляцию loader-ов между экземплярами.

### Prisma 7 и CommonJS

NestJS-проект собран в CommonJS, поэтому генератор Prisma настроен с `moduleFormat = "cjs"`. Клиент генерируется в `src/generated/prisma` (каталог не коммитится) и компилируется вместе с приложением. Prisma 7 требует driver adapter; используется `@prisma/adapter-pg` поверх `pg`.

## База данных

### Схема

```mermaid
erDiagram
    Profile ||--o{ Skill : "has"
    Profile ||--o{ Experience : "has"
    Profile ||--o{ Project : "has"
    Experience ||--o{ Achievement : "has"

    Profile {
        string id PK
        string slug UK
        string name
        string title
        string description
        string email
        string location
        string githubUrl
        string linkedinUrl
        string avatarUrl
        datetime createdAt
        datetime updatedAt
    }
    Skill {
        string id PK
        string name
        string category
        int level
        string profileId FK
    }
    Experience {
        string id PK
        string company
        string position
        string location
        datetime startDate
        datetime endDate
        string description
        string profileId FK
    }
    Achievement {
        string id PK
        string text
        int sortOrder
        string experienceId FK
    }
    Project {
        string id PK
        string name
        string description
        string url
        string repositoryUrl
        string_array technologies
        string profileId FK
    }
```

Индексы по `profileId` и `experienceId`, каскадное удаление дочерних записей. `Achievement.sortOrder` задаёт стабильный порядок достижений.

### Миграции

- Локально: `npm run prisma:migrate -- --name <name>`.
- В Docker, CI и на проде: `prisma migrate deploy` в entrypoint перед стартом приложения.
- SQL миграций коммитится в `prisma/migrations`.

### Сиды

- Логика — `src/database/seed-database.ts`.
- Данные — `src/database/seed-data.ts` (профиль из резюме: последние два места работы, навыки, проекты).
- `SeedService` вызывается в `onApplicationBootstrap`.
- Идемпотентность: поиск профиля по уникальному `slug`; если профиль есть — no-op, иначе создание профиля со связями одной вложенной операцией.
- Ручной запуск: `npm run seed` (Prisma `db seed` → `tsx prisma/seed.ts`).

## Тесты и качество

```bash
npm run typecheck   # tsc --noEmit
npm run test:unit   # Vitest, src/**/*.spec.ts
npm run test:e2e    # Vitest + Testcontainers + реальный PostgreSQL + supertest
npm run validate    # typecheck + unit + e2e
npm run lint
npm run build
```

E2E-контур:

- `tests/e2e/global-setup.ts` поднимает PostgreSQL через Testcontainers и применяет `prisma migrate deploy`.
- `tests/e2e/setup.ts` прокидывает `DATABASE_URL`, включает событийное логирование запросов и режим Vercel-схемы.
- Приложение создаётся реальным Nest-модулем, запросы идут по HTTP через supertest; отдельный тест проверяет serverless-обработчик `api/graphql.js`/`api/health.js`.
- Проверяются health, схема БД, сиды, вложенные GraphQL-поля, introspection, Sandbox, безопасные ошибки, CORS и отсутствие N+1.

Браузерная автоматизация (Playwright) не используется: продукт — backend API, проверять UI нечего. E2E-драйвер — HTTP и реальная БД; это осознанное решение, а не пропуск тестов.

## CI

GitHub Actions (`.github/workflows/ci.yml`) на каждый push и pull request в `main`:

- устанавливает зависимости, генерирует Prisma Client и запускает `npm run validate` (typecheck + unit + e2e на Testcontainers);
- отдельным job собирает Docker-образ.

## Docker

- Multi-stage `Dockerfile`: зависимости → сборка (`prisma generate` + `nest build`) → runtime.
- Runtime на `node:22-slim`, non-root пользователь `node`, `npm ci --omit=dev`.
- `prisma` CLI и `dotenv` оставлены в production dependencies: entrypoint выполняет `prisma migrate deploy` до старта приложения. Это увеличивает образ, но убирает отдельный migrate-контейнер и гарантирует готовность БД.
- `docker-compose.yml`: PostgreSQL с healthcheck, volume и приложение с `depends_on: service_healthy`.
- Порт приложения настраивается через `APP_PORT` (по умолчанию 3000).

## Деплой на Railway

Конфигурация Railway лежит в [`railway.json`](railway.json): Dockerfile builder, healthcheck `/health`, restart policy `ON_FAILURE`.

1. Создать проект и добавить PostgreSQL.
2. Подключить GitHub-репозиторий; Railway соберёт `Dockerfile`.
3. Задать переменные:
   - `DATABASE_URL` — ссылка на PostgreSQL;
   - `NODE_ENV=production`;
   - `CORS_ORIGIN=*` (для демо).
4. Healthcheck — `/health`.
5. После деплоя открыть `/graphql` и выполнить запрос из тестового задания.

Альтернатива через CLI:

```bash
npm i -g @railway/cli
railway login
railway link
railway up
```

Entrypoint применит миграции, приложение выполнит идемпотентные сиды.

### Vercel (serverless)

Vercel — serverless-платформа, поэтому Docker-entrypoint с миграциями там не выполняется. Для Vercel добавлены:

- `src/serverless.ts` — ленивая инициализация Nest-приложения и обработчик;
- `api/graphql.js`, `api/health.js` — функции Vercel;
- `vercel.json` — rewrites `/graphql` и `/health`, build command;
- `npm run vercel-build` — generate → build → CJS-бандл (`scripts/build-serverless.mjs`) → migrate → seed. Бандл нужен, потому что Vercel runtime не поддерживает `require()` ESM-зависимости NestJS 12.

Порядок деплоя:

1. Импортировать GitHub-репозиторий в Vercel.
2. Добавить Vercel Postgres (Neon) или внешний PostgreSQL.
3. Задать переменные окружения:
   - `DATABASE_URL` — pooled URL для runtime;
   - `DIRECT_DATABASE_URL` — direct URL для миграций и сида;
   - `CORS_ORIGIN=*`;
   - `NODE_ENV=production`.
4. Запустить deploy. Build применит миграции и сиды.
5. Корень `https://<project>.vercel.app/` отдаёт `public/index.html` со ссылками; Sandbox — `/graphql`, health — `/health`.

В Vercel вместо отдельного «Postgres» доступны **Neon**, **Supabase** и **Prisma Postgres**.

- **Neon (рекомендую):** стандартный PostgreSQL, есть pooled и direct URL, хорошо работает с `@prisma/adapter-pg`.
- **Supabase:** тоже подходит; для миграций нужен direct URL (не transaction pooler).
- **Prisma Postgres:** подходит только если интеграция выдаёт обычный `postgres://` URL; `prisma+postgres://` текущий `@prisma/adapter-pg` не принимает.

Интеграции добавляют разные имена переменных. Поддерживаются:

- runtime: `DATABASE_URL` или `POSTGRES_URL` (обычно pooled);
- миграции/сид: `DIRECT_DATABASE_URL`, `POSTGRES_URL_NON_POOLING` или `DATABASE_URL_UNPOOLED`.

Если build падает с `The datasource.url property is required`, значит в окружении сборки нет ни одного из этих URL. Подключите базу к проекту (Storage → Neon/Supabase) или задайте строки подключения вручную.

В build-логе Vercel есть диагностические строки `[business-card] Vercel commit:` и `[business-card] DB env:`. Первая показывает, какой commit собирается; вторая — какие DB-переменные видны (только `true`/`false`). Если SHA не совпадает с последним коммитом `main`, Vercel собирает старый код — нужно переподключить репозиторий или сделать redeploy последнего коммита.

Runtime-ошибки Vercel также пишутся в function logs:

- `BUNDLE_LOAD_FAILED` — функция не нашла `dist/serverless.js`; в ответе будет `message` с причиной.
- `SERVERLESS_INIT_FAILED` — ошибка инициализации Nest/Prisma; в ответе будет sanitized-`message`, а в логах — стек и строка `[business-card] runtime DB:`.
- `/health` возвращает `503` с `db: "down"` и sanitized-`message`, если приложение поднялось, но БД недоступна.
- GraphQL внутренние ошибки содержат sanitized-`details` на Vercel; отключить можно `DEBUG_ERRORS=false`.

Ограничения serverless: холодные старты, лимит времени функции и соединений с БД. Для стабильного long-running backend предпочтительнее Docker на Railway/Render; Vercel — удобная альтернатива для демо и проверки API. В Vercel схема GraphQL генерируется в памяти, потому что файловая система функции доступна только для чтения.

Важно для Vercel:

- **Framework Preset: Other / no framework.** Если Vercel выбирает NestJS-пресет, он запускает `src/main.ts` и падает с `ERR_REQUIRE_ESM`. В `vercel.json` зафиксировано `"framework": null`; в dashboard также проверьте Project Settings → General → Framework Preset.
- **Node.js Version: 22.x или новее** (Project Settings → General). NestJS 12 поставляется как ESM; Node >=22.12 поддерживает `require(esm)` для CommonJS-функций. В `package.json` зафиксировано `engines.node >=22.12.0`.
- **Output Directory: `public`** — в репозитории есть `public/index.html`; `vercel.json` задаёт `"outputDirectory": "public"`. Без этого Vercel ругается `No Output Directory named "public"`.
- После изменения настроек обязателен **Redeploy**.

Production: <https://business-card-test-xenialugovayas-projects.vercel.app>. Деплой выполнен через Vercel CLI; проект Vercel использует приватный репозиторий `business-card-test`, публичный исходный код — `business-card`.

Live smoke: `/health` → `200` (`db: up`); GraphQL-запрос возвращает профиль, навыки, опыт с достижениями и проекты.

## Переменные окружения

| Переменная | Обязательна | По умолчанию | Назначение |
| --- | --- | --- | --- |
| `DATABASE_URL` | да* | — | строка подключения PostgreSQL (в Vercel — pooled); *или `POSTGRES_URL` |
| `DIRECT_DATABASE_URL` | нет | `POSTGRES_URL_NON_POOLING` → `DATABASE_URL_UNPOOLED` → `DATABASE_URL` | прямое подключение для миграций/сида (Vercel/Neon) |
| `POSTGRES_URL` | да* | — | pooled URL, автоматически добавляется интеграциями Vercel |
| `POSTGRES_URL_NON_POOLING` | нет | — | direct URL для миграций, автоматически добавляется интеграциями Vercel |
| `DATABASE_URL_UNPOOLED` | нет | — | direct URL, который добавляет Neon-интеграция |
| `PORT` | нет | `3000` | порт HTTP-сервера |
| `NODE_ENV` | нет | `development` | режим приложения |
| `CORS_ORIGIN` | нет | `*` | разрешённые origin через запятую |
| `PRISMA_LOG_QUERIES` | нет | `false` | событийное логирование SQL для e2e-счётчика |
| `DEBUG_ERRORS` | нет | `true` на Vercel | показывать sanitized-детали внутренних ошибок; `false` отключает |

## Структура проекта

```text
.
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── api/                   # Vercel serverless-функции
│   ├── graphql.js
│   └── health.js
├── public/                # статический landing для Vercel
│   └── index.html
├── src/
│   ├── main.ts
│   ├── serverless.ts      # lazy-адаптер для Vercel
│   ├── app.module.ts
│   ├── app.setup.ts
│   ├── config/            # валидация env
│   ├── prisma/            # PrismaModule, PrismaService
│   ├── database/          # seed-data, seed-database, SeedService
│   ├── graphql/           # GraphQLModule, Sandbox
│   ├── common/
│   │   ├── dataloaders/   # one-to-many loader
│   │   └── graphql/       # formatError
│   ├── health/
│   ├── profile/           # Profile, loaders, ExperienceResolver
│   ├── skill/
│   ├── experience/        # Experience, Achievement + сервисы
│   └── project/
├── tests/e2e/
├── Dockerfile
├── docker-compose.yml
├── docker/entrypoint.sh
├── scripts/smoke-docker.sh
├── prisma7.config.ts
├── vercel.json
└── src/schema.gql
```

## Архитектурные решения и компромиссы

- **Feature-модули вместо слоёв-папок целиком.** Каждая предметная область содержит свой тип, сервис и, где нужно, loader/resolver. Это упрощает навигацию и не смешивает GraphQL с доступом к данным.
- **DataLoader на каждую связь, request-scoped.** Гарантирует отсутствие N+1 и отсутствие утечки кеша между запросами. Цена — создание нескольких небольших объектов на запрос, что для визитки незаметно.
- **Code-first GraphQL.** Меньше дублирования и выше типобезопасность; схема генерируется в `src/schema.gql` и коммитится для наглядности.
- **Prisma 7 + CJS.** Современный Prisma с Rust-free клиентом и adapter-pg; CJS выбран для совместимости с текущим NestJS-тулчейном. GraphQL 16, а не 17, потому что Apollo Server 5 требует `^16.11`.
- **Миграции в entrypoint, сиды в bootstrap.** Миграции — инфраструктурная операция перед стартом; сиды — обычный код приложения, который можно тестировать и запускать отдельно. Обе операции идемпотентны.
- **`prisma` CLI в production dependencies.** Компромисс в пользу простого одношагового запуска: миграции применяются тем же контейнером, без отдельного job.
- **Vercel-адаптер.** Nest-приложение инициализируется лениво и отдаётся через Express-инстанс; схема GraphQL в Vercel генерируется в памяти, миграции/сиды выполняются в `vercel-build`. Это добавляет serverless-хостинг, не меняя основной Docker-путь.
- **Introspection включён.** Это требование демо/тестового задания. В реальном проде его стоит отключить и ограничить доступ к Sandbox.
- **Нет auth, mutations и S3.** Вне scope тестового задания: нужен публичный read-only API. Поле `avatarUrl` — строка, без загрузки файлов.
- **Данные профиля.** `src/database/seed-data.ts` содержит данные из резюме: последние два места работы (Банк ДОМ.РФ, СберКорус), backend-фокус, навыки и проекты (Business Card API, Price Ninja, Korus-UI). Seed идемпотентно создаёт или обновляет профиль и связи.

## Чек-лист требований

- [x] Git-репозиторий с осмысленной историей.
- [x] TypeScript, Node.js, NestJS.
- [x] PostgreSQL и Prisma с миграциями.
- [x] GraphQL API и Apollo Sandbox.
- [x] Профиль: имя, описание, ссылки.
- [x] Навыки.
- [x] Опыт: компания, должность, период, достижения.
- [x] Проекты: название, ссылки.
- [x] Автоматическая подготовка и заполнение БД при запуске.
- [x] DataLoader и доказуемое отсутствие N+1.
- [x] Docker: запуск с нуля.
- [x] README с обоснованием решений.
- [x] Ссылка на Git-репозиторий: <https://github.com/klugovaya-droid/business-card>.
- [x] Публичная ссылка: <https://business-card-test-xenialugovayas-projects.vercel.app>.
- [x] Данные профиля из резюме: Банк ДОМ.РФ, СберКорус, Price Ninja, Korus-UI.
