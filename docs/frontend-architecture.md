# Frontend Architecture ADR

**Статус:** актуально на 2026-08-18  
**Репозиторий:** `ecology_v2`  
**Продукт:** закрытый кабинет эколога организации (учёт отходов)

Связанные документы:

- UX и экраны: [`ux-product.md`](./ux-product.md)
- Backend: `D:\eco-wastes-backend\docs\` (`keycloak`, `tenants`, `classifiers_*`, `mdm_*`, `operations`)

Исторические планы в этой папке (`plan-*.md`) описывают промежуточные срезы августа 2026 и **не являются source of truth**.

---

## 1. Scope

### В scope (есть API и живой UI)

| Домен | Backend | UI |
|-------|---------|----|
| Auth Keycloak + `/me` | `keycloak.md` | login-required, PKCE, memory tokens |
| Tenants + `X-Tenant-Id` | `tenants.md` | header select, persist per realm |
| Instructions | `mdm_instructions.md` | список + create/edit |
| Units (иерархия, `is_pod9`) | `mdm_units.md` | дерево / flat ПОД-9 + карточка |
| MDM Wastes | `mdm_wastes.md` | каталог + карточка |
| Waste sources | `mdm_waste_sources.md` | CRUD table + modal |
| UIW bindings (unit → wastes) | `mdm_unit_instruction_wastes.md` | секция на карточке unit `is_pod9` |
| WIU bindings (waste → units) | `mdm_waste_instruction_units.md` | секция на карточке waste |
| Classifier wastes (select) | `classifiers_wastes.md` | combobox, **без** admin CRUD page |
| Regions / districts | `classifiers_regions.md` | каскад в форме unit |
| Operations | `operations.md` | журнал + мастер create/edit |
| Current balance | `GET /operations/balances/current` | подсказка в мастере операции |

### Вне текущего продуктового UI (API нет или UI-заглушка)

- список остатков `/operations/balances` — **API есть, экрана нет**; пункт меню ведёт на 404
- лимиты накопления, нормативы — stub pages
- отчёты ПОД-9 (production), ПОД-10, 1-отходы — нет контракта; `/reports/pod-9` = harness с захардкоженными параметрами
- паспорта перевозки, контрагенты, договоры, перевозчики
- dashboard KPI / графики
- воздух / вода

---

## 2. Контекст продукта

Приложение — SPA-кабинет. Пользователь работает в **одном realm** Keycloak и выбирает **активный tenant** (организация / филиал).

Предметная цепочка, которую должен понимать эколог:

```text
Организация (tenant)
  → Инструкция по обращению с отходами
  → Структура (units); узлы с флагом is_pod9 = места учёта
  → Карточка отхода (ссылка на классификатор + класс / ЕИ / состояние)
  → Привязка: unit + instruction + waste (+ источники, transport_unit)
  → Операция (formed | used) на паре unit + waste
  → Остаток (снимок на backend, write только через операции)
```

Важное расхождение с ранним wireframe:

- операция **не** несёт `instruction_id`;
- backend не проверяет, что пара unit+waste привязана через UIW;
- `is_pod9` — флаг unit, а не отдельная сущность «журнал».

UX-следствия — в [`ux-product.md`](./ux-product.md).

---

## 3. Архитектурное решение

Одно React SPA по **Feature-Sliced Design**:

```text
app → pages → widgets → features → entities → shared
```

- слоёв `modules/` нет;
- микрофронтенды не используются;
- домен отходов — группа `waste/` внутри `pages` / `features` / `entities`;
- слой `widgets/` **ещё не заведён**: таблицы и тулбары живут в `pages` и `features`.

### Фактические отклонения от канона FSD (долг, не блокеры)

| Канон ADR | Сейчас |
|-----------|--------|
| `entities/classifiers/*` | `entities/waste/*-classifier` |
| `entities/waste/mdm-waste` | `entities/waste/wastes` |
| `features/select-tenant` | логика в `TenantProvider` + `AppHeader` |
| `app/layouts/` | `app/layout/` |
| routes `/waste/*` | MDM на `/directories/*`; операции на `/waste/operations` |
| Zustand для tenant/sidebar | React Context |
| `widgets/` | нет |

Новые слайсы класть по канону; массовый rename — отдельным PR, не смешивать с фичами.

---

## 4. Стек

| Слой | Решение | Комментарий |
|------|---------|-------------|
| Bundler | Vite + React 19 + TypeScript | SPA, без Next.js |
| Router | TanStack Router | search params = фильтры |
| Server state | TanStack Query | query keys с `tenantId` |
| Forms | React Hook Form + Zod | |
| Auth | `keycloak-js` | public client `eco-wastes-web`, PKCE S256 |
| UI | Tailwind 4 + Radix + локальный kit в `shared/ui` | shadcn-стиль, не npm-shadcn CLI |
| Tables | TanStack Table | virtualization нет |
| Toasts | свой store + `Toaster` | не sonner |
| Excel preview | `xlsx` (SheetJS) | только harness ПОД-9 |
| Tests | Vitest + Testing Library | |

**Не используем и не добавлять «на вырост»:** Redux, Zustand (пока Context хватает), Next.js, decimal.js (строки decimal как на API).

---

## 5. Структура `src/`

```text
src/
  app/
    providers/          auth, tenant
    layout/             AppLayout, AppHeader, AppSidebar
    router.tsx          compose routes
    router/search-params.ts
  pages/
    dashboard/
      HomePage.tsx
      directories/      hub + stubs
      waste/
        units/
        instructions/
        wastes/
        waste-sources/
        operations/
      reports/pod9.tsx  harness, не продукт
    system/             403 / 404
  features/
    auth/logout/
    generate-report/    POD-9 preview harness
    waste/
      upsert-unit|instruction|waste|waste-source
      bind-unit-instruction-waste
      bind-waste-instruction-unit
      create-operation
      select-*-classifier
  entities/
    user/  tenant/
    waste/
      units, instructions, wastes, waste-sources
      unit-instruction-waste, waste-instruction-units
      operations
      waste-classifier, region-classifier, district-classifier
  shared/
    api/api-client.ts
    auth/
    ui/                 DataTable, Modal, ConfirmDialog, AsyncCombobox, …
    config/             navigation, directories, env
    lib/
```

Import rule: `pages → widgets → features → entities → shared`.  
Слайсы одного слоя не импортируют друг друга напрямую. `app` может вниз.

---

## 6. Auth, tenant, API client

Подробности Keycloak: `D:\eco-wastes-backend\docs\keycloak.md`.

| Тема | Факт в коде |
|------|-------------|
| Client | `eco-wastes-web`, public + PKCE S256 |
| Init | `login-required` |
| Tokens | memory |
| Refresh | `updateToken(30)` перед запросом |
| Roles | `realm_access.roles`; `<Can>` есть, **почти не используется** |
| Logout | `keycloak.logout` + очистка session/cache |
| Realm (dev) | `VITE_KEYCLOAK_REALM` |
| Realm (prod) | `VITE_KEYCLOAK_REALM_HOST_MAP` host/path → realm |

### Boot

```text
1. keycloak.init({ onLoad: "login-required", pkceMethod: "S256", checkLoginIframe: false })
2. GET /api/v1/me
3. GET /api/v1/tenants (?hierarchical=true)
4. восстановить tenantId из sessionStorage[realm] или автовыбор, если tenant один
5. App shell; MDM/operations требуют tenant
```

### Заголовки

| Группа | Bearer | `X-Tenant-Id` |
|--------|--------|---------------|
| `/api/v1/health` | нет | нет |
| `/api/v1/me`, `/tenants` | да | нет |
| `/api/v1/classifiers/**` | да | нет |
| `/api/v1/mdm/**` | да | да |
| `/api/v1/operations/**` | да | да |

`apiFetch`:

- refresh до запроса;
- Bearer всегда;
- `tenantScoped: true` → `X-Tenant-Id`;
- 401 → один forced refresh + retry, иначе login;
- 403 / 400 по tenant → без бесконечного retry.

### Смена tenant

`TenantProvider` → `clearTenantState`: сброс MDM/operations query cache. Активный tenant пишется в `sessionStorage` ключом realm.

---

## 7. Доменная модель (контракт API)

### 7.1. User / Tenant

- User: `id`, `realm`, `uuid`, `username`, `email`, `roles`, `issuer`
- Tenant: `id`, `realm`, `name`, `short`, `parent_id`, `children[]`
- Активный tenant — только frontend context; backend сверяет header с realm токена.

### 7.2. Classifiers (shared)

- WasteClassifier: `id` (PK), `code` (для UI), `name`. В MDM слать **`waste_classifier_id = id`**, не `code`.
- Region / District: read-only. Каскад: смена region → сбросить district.

Admin CRUD классификатора отходов в UI **нет** (API полный CRUD есть; для эколога достаточно select).

### 7.3. Units

Иерархия только через `parent_id`. Типа узла нет.

Write: `name`, `short_name` (null если пусто), `parent_id`, `is_pod9`, `region_id`, `district_id`.

UI-соглашение продукта: `is_pod9 === true` → «место учёта / журнал ПОД-9»: обязателен parent, на карточке показываются UIW-привязки.

### 7.4. Instructions

Статусы: `draft` (default) / `active` / `inactive`.  
Для `active` обязательны `start_date` и `end_date`, `end_date >= start_date`.

### 7.5. MDM Wastes

Не классификатор. Tenant-карточка: classifier + `hazard_class` + `uom` + `physical_state`.

Создание отхода — только в справочнике. Привязка требует уже существующий `waste_id`.

### 7.6. Waste sources

Простой справочник `name`. M2M с UIW через `waste_source_ids`. Удаление источника отвязывает junction, UIW остаётся.

### 7.7. Bindings (одна сущность, два входа)

Unique `(unit_id, instruction_id, waste_id)`.

| Вход | Path | Create body |
|------|------|-------------|
| С карточки unit | `/mdm/units/{u}/instructions/{i}/wastes` | `waste_id` |
| С карточки waste | `/mdm/wastes/{w}/instructions/{i}/units` | `unit_id` |

Общие поля: `waste_source_ids[]` (PATCH = полная замена), `transport_unit` decimal string `0…999999.999999`.

Вкладки инструкций на unit: `GET /mdm/units/{u}/instructions` (только инструкции, у которых уже есть UIW). На waste вкладки берутся из полного списка `GET /mdm/instructions`.

### 7.8. Operations и остатки

Base: `/api/v1/operations`. Tenant-scoped.

| Поле | Правило |
|------|---------|
| `operation_type` | `formed` (+остаток) \| `used` (−остаток) |
| `unit_id`, `waste_id`, `date`, `amount > 0` | required |
| `waste_source_id` | required для `formed`, **null** для `used` |
| `balance` | снимок после операции, read-only |

`used` при нехватке остатка → 400. Backdate / PATCH / DELETE → полный пересчёт цепочки `(tenant, unit, waste)`.

Остатки:

- `GET /operations/balances` — список снимков (UI нет);
- `GET /operations/balances/current?unit_id&waste_id` — текущий остаток (есть в мастере).

---

## 8. Routing (факт)

```text
/                                      HomePage (заглушка)
/directories                           хаб справочников
/directories/instructions
/directories/instructions/new
/directories/instructions/$instructionId
/directories/units                     tree; ?is_pod9=true → flat ПОД-9
/directories/units/new?parentId=&isPod9=
/directories/units/$unitId?instructionId=
/directories/wastes
/directories/wastes/new
/directories/wastes/$wasteId?instructionId=
/directories/waste-sources
/directories/limits                    stub
/directories/norms                     stub
/waste/operations                      журнал; фильтры в search
/reports/pod-9                         harness
/forbidden
$                                      404
```

В меню, но **без route** (404): `/waste/balances`, `/reports/pod-10`, `/reports/1-waste`.

Целевой канон (когда будем трогать IA): `/waste/units|instructions|wastes|waste-sources|operations|balances` + redirect со старых `/directories/*`.

Защита: все routes за AuthGuard (`beforeLoad` → login). MDM/ops экраны — `TenantRequiredGate`.

---

## 9. Состояние

| Состояние | Инструмент |
|-----------|------------|
| Server lists/cards | TanStack Query |
| Forms | RHF + Zod |
| Filters / pagination / tabs | URL search params |
| Active tenant, sidebar collapse | Context / local component state |
| Toasts | `shared/ui/toast-store` |

Query keys (идея):

```text
['auth', 'me']
['auth', 'tenants']
['mdm', tenantId, 'units' | 'instructions' | 'wastes' | …]
['operations', tenantId, 'list' | 'balances' | 'current', …]
['classifiers', 'wastes' | 'regions' | 'districts', …]
```

После create/update брать объект из response.

---

## 10. Ошибки HTTP → UI

| HTTP | UI |
|------|----|
| 400 | tenant header / geo / нехватка остатка (`used`) |
| 401 | refresh / login |
| 403 | нет доступа / чужой realm |
| 404 | toast + возврат к списку |
| 409 | duplicate binding / classifier code |
| 422 | field errors из `detail` |

---

## 11. Права

Роли из JWT: как минимум `admin` / `operator` (уточняется продуктом).  
Backend — источник истины. Пока нет fine-grained permissions — UI может прятать опасные действия, но не полагаться на это как на защиту.

Сейчас `<Can>` не закрывает CRUD. Для эколога это приемлемо на этапе MDM+ops; classifier mutate и массовые delete — закрыть, когда product утвердит матрицу.

---

## 12. Тестирование — критичный путь

1. Login → me → tenants → select tenant.
2. Tenant-scoped запрос без header не уходит / ловит 400.
3. Units tree create child / `is_pod9` child / edit / delete.
4. Instruction draft → active с датами; active без дат → 422 в форме.
5. MDM waste: в API уходит classifier **id**, не code.
6. UIW и WIU: existing waste/unit only; 409 duplicate.
7. Operation `formed` с источником; `used` без источника; `used` больше остатка → ошибка.
8. Смена tenant → нет данных чужого tenant.
9. 401 → один refresh + retry / login.
10. Logout чистит tenant и caches.

---

## 13. Зафиксировано

- Scope = auth + tenants + classifiers (select) + MDM + bindings (оба входа) + operations.
- Инструкция = `mdm/instructions` со статусами `draft` / `active` / `inactive`.
- Units = иерархия без типа узла; `is_pod9` включает UIW на карточке.
- Отход создаётся в MDM wastes; привязка только к существующему waste.
- Binding ↔ sources = M2M; PATCH массива = replace.
- Операции: `formed` / `used`; остаток считается на backend.
- Tenant в `X-Tenant-Id` для `/mdm/**` и `/operations/**`.
- Стеки: Vite SPA + FSD + keycloak-js + TanStack + свой UI-kit.

## 14. Открытые вопросы

1. Должна ли операция требовать UIW-привязку (unit `is_pod9` + waste в инструкции), или любой unit+waste допустим?
2. Матрица `admin` / `operator` по endpoint’ам.
3. Нужен ли отдельный UI CRUD классификатора.
4. Persist tenant: `sessionStorage` — ок для prod?
5. Когда переезжать с `/directories/*` на `/waste/*`.
6. «Журнал ПОД-9» в копирайте vs флаг `is_pod9` vs будущий отчёт ПОД-9 — одно имя на три смысла.
