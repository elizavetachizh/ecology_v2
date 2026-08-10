# План доработок существующего фронтенда

> Цель: довести уже написанный каркас и интегрированные слайсы до контрактов backend / ADR / wireframe.  
> **Код в этом документе — ориентиры и примеры, не патчи для копипаста.**  
> Не изобретать новый стек: опираться на уже принятые паттерны (`apiFetch` / `apiJson`, TanStack Query, entity `api/` + `model/`, RHF+Zod как у инструкций).

**Связанные источники:**  
`eco-frontend-architecture.md`, `eco-keycloak-authentication.md`, `eco-waste-wireframe.md`,  
backend docs: `keycloak.md`, `tenants.md`, `users_me.md`, `mdm_instructions.md`, `mdm_units.md`, `mdm_wastes.md`, `classifiers_*.md`.

**Связанный документ:** [`plan-new-features.md`](./plan-new-features.md) — то, чего ещё нет в UI/API на фронте.

---

## 0. Вердикт код-ревью (кратко)

| Зона | Оценка | Комментарий |
|------|--------|-------------|
| Auth (Keycloak + `api-client`) | Хорошо | PKCE, in-memory tokens, refresh, 401 retry — по ADR |
| Tenant + `/me` | Хорошо, с дырами | Header работает; cache invalidate сломан; нет persistence |
| Instructions CRUD | Хорошо как эталон | Реальный API; форма RHF+Zod; есть мелкие UX/query gaps |
| Waste classifier select | Хорошо | Shared classifier, debounce — правильный паттерн |
| POD-9 preview | Рабочий прототип | Legacy blob adapter ок; страница — test harness |
| Structure / wastes / sources / ops | UI-прототип на моках | Модели **не совпадают** с backend MDM |
| FSD / layout / DataTable | Каркас ок | Нарушения import rules; нет `widgets`; Zustand из ADR не подключён |
| RBAC UI | Не доведено | `<Can>` есть, нигде не используется |

**Эталонный слайс для копирования паттерна:** `entities/waste/instructions` + `features/waste/upsert-instruction`.  
Не плодить новые «самописные сторы на `useSyncExternalStore`» для server state — это временный прототип; целевой путь: TanStack Query + API entity.

---

## 1. Матрица «что уже есть / что доработать»

| Функция | Сейчас | Backend готов? | Тип работы |
|---------|--------|----------------|------------|
| Keycloak login / logout | Реализовано | Да | Доводка (события, UX error) |
| `/me`, `/tenants`, `X-Tenant-Id` | Реализовано | Да | **Баг + доводка** |
| Instructions list/CRUD | Реализовано | Да | Доводка list/query/типов |
| Classifier wastes search | Реализовано (select) | Да | Доводка; admin CRUD — new features |
| Units / structure tree | Частичный cutover на API (~35%) | Да (`/mdm/units`) | **Довести контракт + форму + tree** (см. §5) |
| Regions / districts classifiers | List API + selects есть | Да | Доводка cascade/retrieve (см. §7) |
| MDM wastes catalog | UI + mock store | Да (`/mdm/wastes`) | **Замена мока на API** (см. §6) |
| Formation sources | UI + mock | **Нет docs** | Оставить mock / ждать API → new features |
| Operations journal | UI + mock | Нет docs | → new features |
| Report POD-9 preview | API harness | Legacy `/api/w/pod-9/` | Доводка UX параметров |
| Header: org / instruction / period | Только org | — | Доводка под wireframe |
| Home dashboard | Placeholder | — | → new features |
| RBAC (`Can`, route guards) | Helpers есть | Roles в `/me` + JWT | Доводка |
| Toast / notifications | Нет | — | Доводка инфраструктуры |
| DataTable (pagination/filters/URL) | Базовый | — | Доводка shared |

---

## 2. Критичные баги (сделать первыми)

### 2.1. Смена tenant не чистит TanStack Query cache

**Проблема.** `TenantProvider.selectTenant` снимает queries по `query.meta?.tenantScoped === true`, но ни один `useQuery` этот `meta` не ставит.  
`tenantScoped: true` в `apiFetch` — это **опция запроса (header)**, а не meta React Query.

```71:75:src/app/providers/tenant/TenantProvider.tsx
      await queryClient.cancelQueries({
        predicate: (query) => query.meta?.tenantScoped === true,
      });
      queryClient.removeQueries({
        predicate: (query) => query.meta?.tenantScoped === true,
      });
```

```17:21:src/entities/waste/instructions/model/use-instructions-query.ts
  const instructionsQuery = useQuery({
    queryKey: instructionsQueryKeys.list(listParams),
    queryFn: ({ signal }) => getInstructions(listParams, signal),
    select: (data) => data.items,
  });
```

**Доработка (выбрать один подход, не оба параллельно):**

**Вариант A (предпочтительный, ближе к ADR):** всегда включать `tenantId` в `queryKey` tenant-scoped данных.

```ts
// пример ключа
export const instructionsQueryKeys = {
  all: ["mdm", "instructions"] as const,
  lists: () => [...instructionsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetInstructionsParams) =>
    [...instructionsQueryKeys.lists(), tenantId, params] as const,
};
```

При смене tenant:

```ts
await queryClient.cancelQueries({ queryKey: ["mdm"] });
queryClient.removeQueries({ queryKey: ["mdm"] });
// shared: ["auth"], ["classifiers"] — оставить
```

**Вариант B:** проставлять `meta: { tenantScoped: true }` на каждом tenant query — легко забыть; хуже Variant A.

**Критерий готовности:** после смены организации список инструкций не показывает данные предыдущего tenant даже на долю секунды.

### 2.2. Активный tenant не переживает reload

#### Проблема (как сейчас)

`TenantProvider` держит выбор только в памяти:

```32:56:src/app/providers/tenant/TenantProvider.tsx
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  // ...
  const resolvedTenantId = flatTenants.some(
    (tenant) => tenant.id === activeTenantId,
  )
    ? activeTenantId
    : flatTenants.length === 1
      ? flatTenants[0]!.id
      : null;
```

| Сценарий | Поведение сейчас | Ожидание |
|----------|------------------|----------|
| 1 tenant в пуле | auto-select после `/tenants` — ок | ок |
| 2+ tenants, пользователь выбрал org | после F5 / hard reload → снова `null`, select «Выберите организацию» | восстановить последний валидный выбор |
| 2+ tenants, выбор ещё не сделан | `resolvedTenantId === null` | MDM не стартуют; UI явно просит выбрать org |
| MDM query при `null` | `apiFetch({ tenantScoped: true })` → `ApiError("Не выбран активный tenant", 400)` | запрос **не должен уходить** (`enabled: false`) |
| Logout / смена пользователя | storage никто не чистит (persist ещё нет) | persisted id сбрасывается вместе с сессией |

Backend (`tenants.md`) прямо ожидает: после login → выбрать tenant → **фронт сохраняет id** → дальше `X-Tenant-Id`. Сейчас шаг «сохраняет» не реализован.

Это **не** про токены: в storage кладётся только UUID организации. Access/refresh/ID token по-прежнему только в памяти `keycloak-js` (ADR auth §8).

#### Решение (зафиксировать)

**Хранилище: `sessionStorage`.**

| Вариант | Вердикт | Почему |
|---------|---------|--------|
| Только memory (как сейчас) | ❌ | Ломает UX при F5; расходится с backend SPA flow |
| `sessionStorage` | ✅ default | Живёт на время вкладки; переживает reload; очищается при закрытии вкладки; не тащит org между днями/устройствами |
| `localStorage` | опционально позже | Удобнее «всегда помнить org», но переживает logout вкладки и шарится между вкладками одного origin — нужна явная очистка на logout и осторожность при смене пользователя на том же ПК. **Не брать в PR1**, пока product не попросит |
| Cookie | ❌ | Не нужно; tenant не для SSR/SEO |

**Ключ — с привязкой к realm** (не голый `activeTenantId`):

```ts
// пример имени; realm брать из /me или из tokenParsed
`eco.activeTenantId.${realm}`
// например: eco.activeTenantId.mingas
```

Иначе при смене realm (другой host/env mapping → другой login) можно на долю секунды подставить UUID чужого пула → backend ответит 403, плюс грязный UX.

Значение: строка UUID tenant `id` из `GET /api/v1/tenants`. Никаких объектов, токенов, имён.

Размещение (не изобретать store):

```text
shared/auth/active-tenant-storage.ts   # get/set/clear + ключ по realm
app/providers/tenant/TenantProvider.tsx  # читает/пишет при resolve и selectTenant
shared/auth/cleanup-session.ts         # clear на logout (clearSessionState)
```

Не тащить persist в Zustand «на вырост» — TenantProvider уже source of truth для active tenant.

#### Алгоритм resolve при bootstrap

После успешных `userQuery` + `tenantsQuery` (когда есть `flatTenants` и `user.realm`):

```text
1. candidate = sessionStorage[eco.activeTenantId.${realm}]
2. если candidate ∈ flatTenants.id  → resolved = candidate
3. иначе если flatTenants.length === 1 → resolved = flatTenants[0].id
      (и сразу записать в sessionStorage — чтобы F5 был стабилен)
4. иначе → resolved = null
      (устаревший candidate из storage удалить)
```

Текущую логику `resolvedTenantId` сохранить по смыслу, но **первый приоритет — storage**, затем auto-select одного tenant, затем `null`.

Важно: `useState(null)` можно инициализировать лениво из storage **только если** realm уже известен; на первом кадре realm ещё нет (ждём `/me`). Поэтому надёжнее:

- не читать storage в `useState` initializer без realm;
- после прихода `user.realm` + `flatTenants` один раз вычислить resolved и при необходимости `setActiveTenantId` + sync storage;
- либо хранить в state только явный выбор пользователя, а `resolvedTenantId` считать чистой функцией `(activeTenantId | storedId, flatTenants)`.

Предпочтительный минимальный путь (меньше гонок):

```ts
// псевдокод
const storedId = readActiveTenantId(user.realm); // null если нет/битый
const resolvedTenantId =
  (storedId && flatTenants.some((t) => t.id === storedId) && storedId) ||
  (activeTenantId && flatTenants.some((t) => t.id === activeTenantId) && activeTenantId) ||
  (flatTenants.length === 1 ? flatTenants[0].id : null);
```

Порядок сравнения `stored` vs `state` согласовать так, чтобы после `selectTenant` state и storage совпадали (писать storage синхронно в `selectTenant`).

#### Когда писать / чистить storage

| Событие | Действие |
|---------|----------|
| `selectTenant(id)` успешен | `set(realm, id)` |
| auto-select единственного tenant | `set(realm, id)` |
| stored id ∉ flatTenants | `clear(realm)` |
| `clearSessionState` (logout / session invalid) | `clear(realm)` для текущего realm **или** clear всех ключей с префиксом `eco.activeTenantId.` |
| `clearTenantState` (смена tenant внутри realm) | **не** чистить storage id — наоборот, там уже новый id после `selectTenant`; чистятся только mock/RQ данные (§2.1) |
| закрытие вкладки | `sessionStorage` исчезнет сам |

На logout обязательно вызвать clear storage **до** `keycloak.logout`, иначе при следующем login в той же вкладке (если sessionStorage ещё жив — обычно да до закрытия вкладки) подтянется старый org: это даже желательно для того же пользователя, но после **другого** пользователя на том же SSO-браузере опаснее. Безопасная политика: **clear на logout всегда**; после нового login — либо один tenant auto, либо ручной выбор / restore только если тот же user+realm и id снова в списке.  
Практично: clear на logout + restore только из storage, записанного уже **этой** сессией после login — при sessionStorage после logout+login в той же вкладке storage ещё может быть, если забыли clear → поэтому clear обязателен.

#### Gate MDM-запросов (обязательно вместе с persist)

Persist сам по себе не лечит гонку «children смонтировались, tenant ещё null».

Правило для всех tenant-scoped hooks (instructions уже первый кандидат):

```ts
const { activeTenantId } = useTenant();

useQuery({
  queryKey: instructionsQueryKeys.list(activeTenantId!, params),
  queryFn: ({ signal }) => getInstructions(params, signal),
  enabled: Boolean(activeTenantId),
});
```

Пока `activeTenantId === null`:

- не вызывать `apiJson` MDM;
- UI: empty/disabled состояние, не красный error от 400;
- header select остаётся единственным способом разблокировать кабинет (если tenants > 1).

Опциональный UX (не блокер PR1): если `flatTenants.length > 1 && !activeTenantId` — лёгкий blocking banner / modal «Выберите организацию», контент MDM-страниц не грузить.

#### Связь с §2.1

Делать в **одном PR1** с query-key/`removeQueries`:

1. persist + resolve (§2.2);
2. `tenantId` в queryKey + очистка кэша при смене (§2.1);
3. `enabled: !!activeTenantId` на MDM queries.

Иначе получится: после F5 восстановили tenant, но показали кэш/данные непонятного происхождения, или наоборот — очистили кэш, но сразу отправили MDM без header.

#### Тесты (дополнить `TenantProvider.test.tsx`)

| Кейс | Ожидание |
|------|----------|
| 2 tenants, storage пуст | `activeTenantId === null` |
| 2 tenants, в storage валидный id | после load → этот id, без клика |
| 2 tenants, в storage чужой/старый id | `null` + ключ очищен |
| 1 tenant, storage пуст | auto-select этого id + запись в storage |
| `selectTenant` | storage обновлён; `onTenantChange` вызван |
| `clearSessionState` / logout path | ключ storage отсутствует |
| MDM hook с `enabled` | при `null` `getInstructions` не вызывался |

`sessionStorage` в jsdom мокать/чистить в `beforeEach`.

#### Критерий готовности

1. Пользователь с 2+ orgs выбирает организацию → F5 → та же организация в header, MDM-списки грузятся с тем же `X-Tenant-Id`.
2. Пока организация не выбрана — MDM-запросов в Network нет.
3. Logout → повторный login → нет «прилипшего» tenant от предыдущей сессии без проверки membership в свежем `/tenants`.
4. Токены по-прежнему отсутствуют в `sessionStorage` / `localStorage`.

### 2.3. Hybrid domain: реальные instruction id + mock wastes

`getWastesByInstruction` в delete-guard инструкций читает **mock** store. После реальных инструкций guard либо всегда пустой, либо завязан на демо-id.

**Доработка:** до подключения `/mdm/wastes` — либо убрать «мягкий» guard, либо показывать warning «проверка связей пока недоступна», а не опираться на mock. После §6 — проверять через API (или backend 409, если появится).

---

## 3. Auth / session — доводка существующего

Уже сделано хорошо: `login-required`, PKCE S256, memory tokens, `updateToken(30)`, visibility refresh, logout + `clearSessionState`.

| # | Задача | Детали / пример |
|---|--------|-----------------|
| A1 | Явные auth statuses в UI | ADR: `initializing \| authenticated \| unauthenticated \| refreshing \| error`. Сейчас loading/error есть; убедиться, что error-экран с retry не теряется при частичных сбоях Keycloak. |
| A2 | Обработка adapter events | Подключить синхронизацию React-state на `onAuthRefreshError` / `onAuthLogout` (если ещё не все ветки закрыты). Токены в логи не писать. |
| A3 | `403` → Forbidden page | `api-client` кидает `ApiError` code `forbidden`. На уровне router/error boundary — маршрут `/forbidden` уже есть; связать с UI-действием (не silent fail в таблице). |
| A4 | Парсинг тела ошибок API | Сейчас: ``Сервер вернул ошибку ${status}``. Backend отдаёт `detail` (string / validation array). Доработать `apiJson`/`apiFetch` — читать JSON error body и показывать пользователю (422 instructions, 400 geo mismatch). |
| A5 | `<Can>` на существующие действия | Обернуть кнопки «Создать/Удалить инструкцию», «Сформировать отчёт» по ролям из `user.roles` / `realm_access`. Не придумывать новые permission-строки — согласовать список с backend (пока роли сырые из JWT). |
| A6 | Route-level guard по ролям | Для `/directories/*` manage vs read — после фиксации permission names. |

**Не делать:** password grant, хранение tokens в storage, собственный JWT verify на фронте.

---

## 4. Instructions — доводка эталонного CRUD

### 4.1. Разделить «options для селекта» и «список справочника»

Сейчас `useInstructionsOptions` с `limit: 20` используется и на странице списка (`instructions.tsx`). Для справочника нужны пагинация, status filter, sort из URL.

**Доработка:**

```ts
// entities/.../use-instructions-list-query.ts  (новый hook рядом)
useQuery({
  queryKey: instructionsQueryKeys.list(tenantId, paramsFromUrl),
  queryFn: ({ signal }) => getInstructions(paramsFromUrl, signal),
  enabled: !!tenantId,
  meta: { tenantScoped: true }, // только если выбран Variant B из §2.1
});

// useInstructionsOptions — оставить для combobox (limit 20, debounce)
```

URL state (как в ADR §8): `?search=&status=&sort=name&order=asc&limit=50&offset=0`.

### 4.2. Типы vs backend Read model

Backend отдаёт audit: `created_at`, `updated_at`, `created_by`, `updated_by` (`UserProfile`).  
Фронтовый `Instruction` их не описывает — не ломает runtime, но мешает карточке инструкции из wireframe.

**Доработка:** расширить тип опциональными audit-полями; не слать их в POST/PATCH (уже так).

### 4.3. UX списка / карточки

Wireframe §6: карточка инструкции с вкладками (Общие / Отходы / …). Сейчас — форма create/edit.

| Приоритет | Что сделать сейчас |
|-----------|-------------------|
| P0 | List: колонки short_name, даты, статус; фильтр status; серверная пагинация |
| P1 | Empty / loading / error states единообразно с DataTable |
| P2 | Карточка-просмотр + вкладки — когда появятся связи wastes (после §6); до этого не рисовать пустые вкладки «для красоты» |
| P1 | Toast после create/update/delete (после появления toast-инфры §8) |
| P1 | Invalidation: после mutate инвалидировать `lists()` **и** `detail(id)` |

### 4.4. Форма — уже близко к контракту

`instruction-form.schema.ts` корректно требует даты при `active` и `end >= start`. Сохранить как шаблон для других MDM-форм.

**Мелочи:**

- `short_name: ""` → при submit маппить в `null` / omit (как уже в `map-instruction-form`, проверить edge cases).
- Показать server 422 рядом с полями, не только общим Alert.

---

## 5. Structure / Units — статус после правок (повторное ревью)

> Дата ревью: 2026-08-10. Оценка cutover к `mdm_units.md`: **~35%**.  
> Прогресс есть; create/edit против живого API ещё не end-to-end.

### 5.0. Что уже сделано (OK)

| Тема | Статус | Где |
|------|--------|-----|
| Entity CRUD paths `/api/v1/mdm/units` + `tenantScoped` | OK | `entities/waste/units/api/*` |
| Query keys с `tenantId` | OK | `unit-query-keys.ts` |
| Read model: nested `region` / `district` `{id,name}\|null` | OK | `units.types.ts` |
| Form schema: `region_id` / `district_id` as `number` | OK (направление) | `unit-form.schema.ts` |
| Edit hydrate из nested geo (`initial.region?.id`) | OK | `use-upsert-unit-form.ts` |
| `useUnitsListQuery` + delete через API на structure page | Частично | `structure.tsx` |
| Колонки `name` / `short_name` (вместо mock `code`) | OK | `structure.tsx` |
| Create/Edit pages через `UnitForm` + `getUnit` | Каркас OK | `unit-pages.tsx` |
| Zod: `name` + `short_name` required | OK | schema |

### 5.1. Доменное уточнение (без изменений)

Backend MDM units = **только иерархия units** (`parent_id`). POD-9 в API units **нет**.

| Решение | Рекомендация |
|---------|--------------|
| MVP structure UI | Дерево = только units из `GET ?hierarchical=true` |
| POD-9 | Отдельная сущность/прототип; не смешивать с MDM tree. Сейчас POD-9 ещё на `structure.store` (pod9 pages, wastes, ops) |

### 5.2. Что ещё не так vs backend (обязательный backlog)

#### P0 — блокер против API

1. **Write-поля названы неверно** (`units.types.ts`)  
   Сейчас: `region` / `district` на Create/Update.  
   Нужно: `region_id` / `district_id`: `number \| null`.  
   Update: `short_name` сделать optional; разрешить `parent_id` / geo = `null` для clear.

2. **`map-unit-form.ts` сломан**  
   Делает `.trim()` на `number`; пытается отдать `region_id` в тип, где поля ещё `region`/`district`.  
   Исправить: писать `region_id`/`district_id` числами (или omit/null), без `.trim()`.

3. **`getUnits` hierarchical** (`get-units.ts`)  
   `if (params.hierarchical) set("hierarchical", "true")` → строка `"false"` truthy → **всегда tree**.  
   Structure page сейчас шлёт `hierarchical: "false"` → рискует получить массив дерева, а `useUnitsListQuery` читает `.items` → пустой UI.  
   Нужно: `boolean` или явное сравнение с `"true"`; типы: flat = `Page`, tree = `UnitTreeRead[]` с `children`.

4. **`UnitForm` wiring селектов** (`UnitForm.tsx`)  
   - нет `watch`/`setValue`/`Controller` — `form.region_id` не существует на RHF;  
   - `register("region_id", { value })` не биндит AsyncCombobox;  
   - `onChange` select ждёт classifier object, хендлеры принимают `string`;  
   - нет clear `district_id` при смене region;  
   - нет UI `parent_id`;  
   - копипаста: текст про инструкцию, `htmlFor="start_date"/"end_date"`, Alert `"..."`.

5. **Structure page UX vs API** (`structure.tsx`)  
   - нужен **tree** (`hierarchical=true` + `getSubRows` / `children`), сейчас flat + закомментированный `getSubRows`;  
   - search UI не попадает в `params.search`; в route `StructureSearch` нет `q`/`offset`/`limit`;  
   - pagination UI есть, но query всегда `offset: 0`, `limit: 100`;  
   - edit Link ведёт на **instructions** (`/directories/instructions/$instructionId`) — баг копипасты;  
   - тексты/confirm ещё упоминают ПОД-9 / «инструкции»;  
   - mock expand ids `unit-1` / `unit-1-1` — убрать.

#### P1 — cutover / продукт

6. **`parentId` из URL** — route отдаёт, `CreateUnitPage` / форма игнорируют; нужен parent select.  
7. **Навигация** — `unit-pages` ходит на несуществующий `/directories/structure/units`; cancel create → instructions. Цель: `/directories/structure` (+ focusId).  
8. **Sort/filter params** — sort `region_id`/`district_id`/`id`; filters `region_id`/`district_id`; убрать несуществующий filter `parent_id` (или не слать).  
9. **`useUnitsTreeQuery`** отдельно от flat list (как в эталоне instructions options vs list).  
10. **Mocks leftover** — `structure.store` / `structure.mock` / `saveUnitApi` / `structure-columns` ещё нужны wastes/ops/pod9; для units-path перестать опираться. FSD: entities/shared → pages store.  
11. **POD-9 decision** — убрать из units copy или держать только на отдельных mock-роутах с пометкой.

#### P2 — polish

12. Form copy / a11y labels.  
13. `cleanup-session`: `removeQueries(["mdm","units"])` (+ classifiers не трогать).  
14. Удалить мёртвый UI (`structure-columns` если не используется новой страницей; `saveUnitApi` когда никто не импортирует).  
15. Починить `useUnitsOptions` (naming, safety при hierarchical).

### 5.3. Целевая структура слайса (актуально)

Уже близко к:

```text
entities/waste/units/          # имя можно позже поднять к structural-unit
  api/ get-units, get-unit, create, update, delete
  model/ units.types, unit-query-keys, use-units-list-query
  (+ добавить use-units-tree-query)

features/waste/upsert-unit/
features/waste/select-region-classifier/
features/waste/select-district-classifier/
```

Не хватает: корректных Write-типов, tree query, рабочей формы, URL state на structure.

### 5.4. Контракт (напоминание)

**Write:**

```json
{
  "name": "Филиал",
  "short_name": "Ф",
  "parent_id": null,
  "region_id": 1,
  "district_id": 10
}
```

**Read:** nested `region`/`district`; сырых `region_id` в ответе нет.  
Смена region в UI → `district_id = null` + refetch districts.

**Tree:**

```http
GET /api/v1/mdm/units?hierarchical=true
```

Ответ: массив с `children`, **без** Page.

### 5.5. Cleanup session

Пока wastes/ops ещё на `structure.store` — `resetStructureStore` оставлять.  
Для units-кэша дополнительно: `removeQueries({ queryKey: ["mdm", "units"] })`.  
После полного отказа от mock structure — убрать reset store из units-path.

---

## 6. MDM Wastes — заменить mock на `/api/v1/mdm/wastes`

### 6.1. Расхождение модели (критично)

| Frontend `DirectoryWaste` | Backend MDM Waste |
|---------------------------|-------------------|
| `instructionId` | **нет** в API |
| `classifierId: string` | `waste_classifier_id: number` |
| `code`, `name` на карточке | берутся из nested `waste_classifier` |
| `hazardClass`: `"I"…"V"` | `hazard_class`: `class_0`…`class_5` |
| `unit`: `"т","кг","м³"…` | `uom`: `kg` \| `ton` \| `pcs` |
| — | `physical_state`: `solid` \| `liquid` \| null |
| `WasteBinding` (unit/pod9/source) | **нет в docs** |

**Уточнение:** привязка отхода к инструкции / unit / ПОД-9 / источнику — отдельная предметная модель; её нет в текущих backend docs.  
**MVP под существующий API:** карточка MDM waste = classifier FK + hazard + uom + physical_state.  
Bindings / dual entry-point «из узла структуры» — в [`plan-new-features.md`](./plan-new-features.md) после появления API **или** осознанный front-only прототип с пометкой.

### 6.2. Что переиспользовать

- `features/waste/select-waste-classifier` — уже правильный async select по `/classifiers/wastes`.
- Паттерн upsert как у instructions: RHF + Zod + mutation hooks.
- Enums — строковые литералы backend, labels для UI:

```ts
export const HAZARD_CLASS_LABEL: Record<HazardClass, string> = {
  class_0: "Не классифицирован",
  class_1: "I",
  class_2: "II",
  class_3: "III",
  class_4: "IV",
  class_5: "Неопасный",
};
```

Не оставлять `"I"…"V"` в API layer.

### 6.3. Слайс

```text
entities/waste/waste-item/   # ADR имя; сейчас directory/
  api/*  → /api/v1/mdm/wastes
  model/waste.types.ts       # = backend Read/Write
  model/waste-query-keys.ts
  model/use-wastes-query.ts

features/waste/upsert-waste/ # переписать store → API mutations
```

Удалить зависимость `wastes.store` → `structure.store`.

### 6.4. Страница списка

Фильтры из API: `search`, `hazard_class`, `physical_state`, sort, limit/offset.  
Колонки: code/name из `waste_classifier`, hazard, uom, physical_state.

Убрать обязательный фильтр «по инструкции», пока backend не отдаёт связь.

---

## 7. Classifiers regions/districts — статус

> Оценка list+select: **~85%**. Нужна доводка cascade/retrieve.

### 7.0. OK

| Тема | Статус |
|------|--------|
| `GET /classifiers/regions` + Page `{id,name}` | OK |
| `GET /classifiers/districts?region_id` | OK |
| Без `X-Tenant-Id` | OK |
| Debounce + limit в options hooks | OK |
| `enabled: Boolean(region_id)` у districts | OK |
| UI `RegionClassifierSelect` / `DistrictClassifierSelect` | OK как компоненты |
| `getRegion(id)` добавлен | Есть файл; **не экспортирован / не используется** |

### 7.1. Доработать

| # | Задача | Почему |
|---|--------|--------|
| C1 | `region_id` в `queryKey` districts | Иначе кэш районов чужой области |
| C2 | `GET /districts/{id}` + export `getRegion` / `getDistrict` | Edit: `selectedLabel`, когда id нет в первой странице search |
| C3 | `getRegion` id тип `number` (сейчас `string`) | Backend PK number |
| C4 | Каскад в UnitForm: смена region → clear district | Docs + UX |
| C5 | Удалить `entities/waste/region-classifier copy/` | Мусор |
| C6 | (опц.) вынести classifiers из группы `waste/` | Платформенные shared classifiers |

Правила (без изменений): shared → без tenant; debounce; district только после region.

---

## 8. Shared UI / инфраструктура (доводка)

| # | Задача | Зачем |
|---|--------|-------|
| S1 | Toast provider (например sonner / radix toast в стиле shadcn) | Wireframe + ADR; сейчас нет обратной связи после mutate |
| S2 | DataTablePagination + server mode | Instructions / wastes / units flat |
| S3 | URL sync helpers для filters | ADR §8; не Zustand для фильтров |
| S4 | StatusBadge | Единый вид draft/active/… |
| S5 | Исправить имя файла `field-lavel.tsx` → `field-label.tsx` | Мелочь качества |
| S6 | Вынести nav config из `directories.mock` | `shared/config/navigation` не должен импортировать `pages` |
| S7 | Error body parsing в api-client | см. A4 |
| S8 | Query defaults | Сейчас no retry / no refetchOnFocus — осознанно; документировать в коде |

**Zustand (ADR):** для `activeTenantId`, выбранной инструкции, периода, sidebar collapsed — один тонкий `app-ui.store` **или** расширить существующие React contexts. Не дублировать: либо Context (как сейчас Tenant), либо Zustand; не оба на одно и то же.  
Не переносить server lists в Zustand.

---

## 9. App shell / Header / Navigation

Wireframe §3.3 — верхняя панель:

| Элемент | Сейчас | Доработка |
|---------|--------|-----------|
| Организация | ✅ Select | Persist + tree label (short/name) |
| Инструкция | ❌ | Combobox на `useInstructionsOptions` + store/context; hint если не выбрана |
| Период | ❌ | Date range в header context (для ops/reports позже) |
| `+ Создать операцию` | ❌ | Кнопка → `/waste/operations` + open modal (пока mock ok) |
| `Сформировать отчет` | ❌ | → `/reports/pod-9` |
| Уведомления | Icon noop | Скрыть до появления API или disabled + tooltip |
| Профиль | ✅ username | Ок; роли — опционально |

**Навигация:** пункты `/waste/balances`, `/reports/pod-10`, `/reports/1-waste` ведут в NotFound.  
До реализации (new features) — **убрать из меню** или пометить disabled («Скоро»), чтобы не ломать доверие к UI.

Home «Каркас приложения» — контент dashboard в new features; сейчас достаточно честного empty state.

---

## 10. Report POD-9 preview — доводка существующего

Уже правильно:

- legacy binary → SheetJS pipeline (`previewPod9Report`);
- `Content-Disposition` filename;
- `tenantScoped: true`.

Доработать страницу `reports/pod9.tsx`:

1. Форма параметров вместо `TEST_PREVIEW_PARAMS` (company, department, wastes, dates) — поля согласовать с реальным query legacy API.
2. Клиентская валидация обязательных полей до запроса.
3. Loading / empty / error / warnings UI.
4. Кнопка «Скачать тот же blob» без повторного запроса.
5. Не блокировать будущий JSON+base64: оставить adapter слой (`blob` \| `contentBase64` → единый `ReportPreview`).

Архив отчётов / PDF / ПОД-10 — в new features.

---

## 11. FSD / качество кода (рефакторинг без новой фичи)

| Нарушение | Где | Исправление |
|-----------|-----|-------------|
| `entities` → `pages` | `wastes.store` → `structure.store` | Перенос unit entity (§5) |
| `shared` → `pages` | `cleanup-session`, `navigation` | shared зависит только от entities/shared |
| `features` → `pages` | `CreateOperationModal` → structure.store | Через entity API/hooks |
| Domain store в pages | `structure.store` | → `entities/waste/structural-unit` |
| Нет `widgets` | Журналы/хабы в pages | По мере роста вынести table+filters в `widgets/waste/...`; не обязательно в первом PR |
| `<Can>` unused | `app/providers/auth/Can.tsx` | Подключить (§3 A5) |
| Формы: RHF vs useState | instructions vs unit/waste | Новые/переписываемые формы — только RHF+Zod |

**Импорт-правило зафиксировать в PR checklist:**  
`pages → widgets → features → entities → shared`; `app` может вниз; слайсы одного слоя не импортируют друг друга.

---

## 12. Тесты — доводка

Уже есть: api-client, token-refresh, permissions, env, AuthProvider, TenantProvider, logout.

Добавить по мере доработок:

| Тест | Фокус |
|------|-------|
| Tenant switch | query keys с tenantId очищаются / не утекают данные |
| Instructions schema | active без дат → fail; end < start → fail |
| api error body | 422 detail mapping |
| Unit form cascade | region change clears district (unit/integration) |
| Waste mapper | UI labels ↔ API enums |

E2E из ADR — после стабилизации auth+instructions+units.

---

## 13. Рекомендуемый порядок PR (существующее)

```text
PR1  Баги tenant: query keys + persist + enabled флаг
PR2  api-client error body + toast + nav cleanup (dead links)
PR3  Instructions list: pagination/filters/URL (эталон списка)
PR4  Classifiers regions/districts — list+select ~готово; добить C1–C5 (§7)
PR5a Units contract: Write region_id/district_id + getUnits hierarchical/tree types + map-unit-form
PR5b UnitForm: RHF Controller/setValue + cascade + parentId + selectedLabel
PR5c Structure page: hierarchical tree UI, search/URL, edit/delete links, copy cleanup
PR5d Drop units-path mocks / POD-9 из units tree; leftovers wastes/ops — follow-up
PR6  MDM wastes: entity API + form enums (drop wastes.store; без bindings)
PR7  Header context: instruction select + report/operation shortcuts
PR8  POD-9 report page: параметры вместо TEST_* 
PR9  RBAC Can + route guards (когда список ролей согласован)
PR10 FSD cleanup imports / rename field-label / session cleanup
```

Каждый PR — рабочий main; не смешивать «подключение units API» с «новым журналом операций».

---

## 14. Что сознательно НЕ делать в рамках «доработок существующего»

- Не писать свой state-manager вместо Query для серверных списков.
- Не оставлять parallel mock+API «на всякий случай» после cutover.
- Не маппить hazard `I`→`class_1` в UI без явного слоя mapper (один source of truth = API enum).
- Не реализовывать balances / passports / POD-10 / dashboard KPI — см. new features.
- Не добавлять Next.js, Redux, MUI как вторую дизайн-систему.
- Не делать admin CRUD классификатора отходов, пока product не попросил (API умеет; UI select достаточно для MDM).

---

## 15. Открытые вопросы (нужен ответ product/backend)

1. ПОД-9 в дереве структуры — остаётся только UI-прототип или будет API?
2. Связь Waste ↔ Instruction / Unit / Source — какой endpoint и модель?
3. Финальный список realm roles / permissions для `<Can>`?
4. ~~Persist tenant: `sessionStorage` vs memory~~ — **решено в §2.2:** `sessionStorage` + ключ по realm; `localStorage` только по отдельному запросу product.
5. Legacy `/api/w/pod-9/` query params (`company`, `department`, `wastes`) — стабильный контракт или временный?
6. Preview переводят на JSON+base64 или живём на blob adapter дольше?
