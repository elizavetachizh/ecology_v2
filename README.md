# ПО Эколог — кабинет учёта отходов

Закрытое SPA для эколога организации: справочники MDM, привязки отходов к местам учёта, журнал операций и остатки (остатки — API есть, экран в работе).

Документация: [`docs/frontend-architecture.md`](docs/frontend-architecture.md), [`docs/ux-product.md`](docs/ux-product.md).

## Стек

Vite + React 19 + TypeScript, TanStack Router / Query / Table, React Hook Form + Zod, keycloak-js, Tailwind 4.

## Запуск

Нужен backend `eco-wastes-backend` и Keycloak (client `eco-wastes-web`, PKCE).

```bash
cp .env.example .env   # если файла ещё нет
npm install
npm run dev
```

Обязательные переменные: `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_REALM`, `VITE_KEYCLOAK_CLIENT_ID`, `VITE_APP_URL`, `VITE_API_BASE_URL`.

```bash
npm test          # vitest watch
npm run test:run  # CI
npm run build
```

## Карта `src/`

```text
app/        shell, router, providers (auth, tenant)
pages/      экраны
features/   действия пользователя (upsert, bind, create-operation)
entities/   API + типы + query hooks
shared/     api-client, ui-kit, config
```

Импорты только вниз: `pages → features → entities → shared`.
