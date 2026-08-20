# Ревью справочников MDM + план доработки

> **Не актуален 2026-08-18** (имя файла `_IRRELEVANT`). Смотреть [`frontend-architecture.md`](./frontend-architecture.md) и [`ux-product.md`](./ux-product.md).

> Дата: 2026-08-11  
> Контекст: после cutover instructions / units / wastes / waste-sources видны отклонения от ТЗ (ADR/wireframe), backend-контрактов и принятых правил разработки (FSD + эталон instructions).  
> Связано: [`plan-existing-improvements.md`](./plan-existing-improvements.md), backend `mdm_*.md`, `mdm_waste_sources.md`.

**Эталон:** `entities/waste/instructions` + `features/waste/upsert-instruction` + list page с URL search.

---

## 0. Вердикт

| Слайс | Cutover API | Соответствие эталону | Главный риск |
|-------|-------------|----------------------|--------------|
| Instructions | ✅ | Эталон | Delete guard на **mock** wastes |
| Units / structure | ✅ (~90% units) | Хорошо | Не инвалидируется **tree** после upsert; POD-9 всё ещё mock |
| Wastes catalog | ✅ | Хорошо | Рядом живёт mock `directory`; copy про bindings |
| Waste sources | ✅ | Хорошо (modal UX) | Dual naming + select всё ещё на **mock** `formation-source` |
| Classifiers | ✅ selects | Ок | Нет единых query-key factories |
| POD-9 / ops / hub counts | ❌ mock | — | Смешение доменов с MDM |

**Общий вывод:** CRUD-справочники в целом повторяют правильный паттерн, но нет **единого checklist’а слайса**, из‑за чего копипаста даёт расхождения UX/FSD/cache. Критично: смена tenant **не чистит** MDM cache; mock-слой протекает в живые MDM-страницы.

---

## 1. Матрица «эталон vs факт»

| Правило / паттерн | instructions | wastes | units | waste-sources |
|-------------------|--------------|--------|-------|---------------|
| `entities/.../api` + `model` + public `index` | ✅ | ✅ | ✅ | ✅ |
| Query keys `["mdm", …, tenantId, …]` | ✅ | ✅ | ✅ | ✅ |
| `enabled: Boolean(tenantId)` | ✅ | ✅ | ✅ | ✅ |
| List hook ≠ options hook | ✅ | ✅ | ✅ (+ tree) | ✅ |
| Router `validateSearch` (q/sort/order/limit/offset) | ✅ | ✅ | tree: q/focus | ✅ |
| Tenant empty-state на page | ✅ | ✅ | ✅ | ✅ |
| Upsert RHF + Zod | ✅ | ✅ | ✅ | ✅ |
| Full-page create/edit routes | ✅ | ✅ | ✅ | ❌ modal only |
| Options hook реально используется | ❌ | ❌ | ✅ | ❌ |
| `DataTable isLoading` | ✅ | ❌ | ✅ | ❌ |
| Invalidate после mutate полный | ✅ | ✅ | ❌ нет `trees()` | ✅ |
| Нет зависимости от mock directory/formation | ❌ delete | ✅ list | ✅ units-path | ❌ select/POD-9 |

---

## 2. Код-ревью (приоритеты)

### P0 — корректность / целостность данных

#### P0.1. Смена tenant не чистит TanStack Query cache
- **Где:** `TenantProvider.selectTenant` — `predicate: meta?.tenantScoped === true`
- **Факт:** ни один MDM `useQuery` не ставит `meta.tenantScoped`
- **Эффект:** `cancelQueries` / `removeQueries` — no-op; ключи с `tenantId` изолируют данные, но кэш старого tenant остаётся до GC
- **Цель:** `removeQueries({ queryKey: ["mdm"] })` (+ classifiers tenant-scoped при необходимости). Либо Variant B: проставлять `meta: { tenantScoped: true }` во **всех** tenant hooks — хуже, легко забыть

#### P0.2. Instructions delete gated mock wastes
- **Где:** `pages/.../instructions.tsx` → `getWastesByInstruction` из `entities/waste/directory`
- **Эффект:** ложные блокировки / отсутствие реальной проверки связей
- **Цель:** убрать guard или warning «проверка связей недоступна»; после UIW API — backend 409 / реальный check

#### P0.3. Dual world: MDM API vs mock store
| Live MDM | Mock leftover | Где протекает |
|----------|---------------|---------------|
| `entities/waste/wastes` | `entities/waste/directory` | instructions delete, POD-9, ops, `waste-detail.tsx` |
| `entities/waste/waste-sources` | `entities/waste/formation-source` | `FormationSourceSelect`, `cleanup-session`, POD-9 |
| `entities/waste/units` | `pages/.../structure.store` | POD-9 pages, create-operation |

**Цель:** MDM pages/features не импортируют mock. Mock — только за явным boundary (`pod9/*`, `operations/*`) с пометкой «прототип».

#### P0.4. Select источников пишет в mock, справочник — в API
- **Где:** `features/waste/select-formation-source` vs page `/directories/formation-sources`
- **Эффект:** ID из справочника не попадут в POD-9 select
- **Цель:** select → `useWasteSourcesOptions` + `createWasteSource`; mock store только для legacy POD-9 до UIW

---

### P1 — архитектура / правила разработки / ТЗ

#### P1.1. Naming drift (нарушение единого языка с backend)
| Слой | Имя |
|------|-----|
| Backend / entity | `waste-sources` |
| Route / hub card | `formation-sources` |
| Mock entity / select | `formation-source` |
| Docs (старые) | `generation-source` |

**Цель:** один канон в коде — `waste-sources` (как API). UI copy: «Источники образования». Route можно оставить alias или переименовать с redirect.

#### P1.2. FSD нарушения
| Нарушение | Где |
|-----------|-----|
| `features` → `app` | `UnitForm` → `useTenant` |
| `features` → `pages` | `CreateOperationModal` → `structure.store` |
| `entities` → `pages` | `directory/wastes.store` → `structure.store` |
| `shared` → `entities` | `cleanup-session` → `resetFormationSourcesStore` |
| `shared` → `pages` | `navigation.ts` → `directories.mock` |

**Цель:** tenantId/`enabled` спускать с pages; session cleanup — только storage + `queryClient`, без entity mocks; navigation config без pages.

#### P1.3. Units: нет invalidate `trees()` после upsert
- **Где:** `use-upsert-unit-form.ts` — только `lists()` / `details()`
- **Эффект:** дерево structure может показывать старые данные

#### P1.4. `cleanup-session` / `onTenantChange` неполные
- Сейчас: только `resetFormationSourcesStore()`
- Нет: `removeQueries(["mdm"])`, reset directory/structure mocks при tenant change (если mocks ещё нужны — все, не один)

#### P1.5. Checklist слайса не соблюдён единообразно
Обязательный чеклист для каждого MDM справочника (зафиксировать как rule):

1. Types = backend Read/Write (snake_case API keys)
2. Query keys factory + `tenantId`
3. `useXListQuery` + `useXOptions` (options не использовать для directory list)
4. Page: tenant gate, URL search, pagination, `isLoading`
5. Upsert: RHF+Zod, map to write DTO, invalidate lists(+trees)+details
6. Delete: ConfirmDialog; без mock guards
7. Public `index.ts` exports только публичный контракт
8. Никаких импортов из `directory` / `formation-source` / `structure.store`

#### P1.6. UX-расхождения списков (wireframe/consistency)
- Search button: `outline` vs `secondary`
- `isLoading` отсутствует на wastes / waste-sources
- Waste-sources: только modal (допустимо для 1 поля) — зафиксировать как исключение в правиле, не плодить третий стиль без причины
- Hub `directories.mock`: статичные count/fillStatus — врут относительно API
- Copy wastes/sources всё ещё про «привязки к ПОД-9» как будто это часть MDM catalog

#### P1.7. Документы планов устарели
- `plan-existing-improvements.md` §0/§1: wastes/sources ещё «mock / нет docs»
- `plan-new-features.md`: sources «ждать API» — API уже есть
- §5 units P0 частично уже сделан в коде

---

### P2 — гигиена / polish

- Orphan `waste-detail.tsx` (bindings UI) — удалить или явно пометить prototype-only / не в router
- Options hooks мёртвые exports (instructions/wastes/sources) — либо подключить в header/selects, либо не экспортировать до use
- Classifier query keys ad-hoc vs MDM factories
- `getRegion` не в public export; типы id
- Нет toast (S1) — success только inline на full-page forms
- Delete mutation: нет единого pending-lock на confirm
- Query-key file naming: `*-query-keys.ts` единообразие
- `UnitForm` unused props (`_showNextStepCta`)

---

## 3. План доработки (порядок работ)

### PR-A — Tenant cache + session (блокер)
1. `TenantProvider`: `removeQueries({ queryKey: ["mdm"] })` (+ cancel)
2. `clearTenantState` / `onTenantChange`: убрать зависимость от одного mock store; чистить `["mdm"]`; mocks reset сгруппировать в один `resetPrototypeStores()` рядом с POD-9/ops (не в `shared/auth` ideally)
3. Тест: смена tenant → нет данных предыдущего tenant в UI

### PR-B — Изоляция mock от MDM pages
1. Instructions: убрать `getWastesByInstruction` из delete UX
2. Запретить импорты `directory` / `formation-source` / `structure.store` из MDM list/form pages (eslint boundary или code review checklist)
3. Удалить/архивировать orphan `waste-detail.tsx` если не в router

### PR-C — Waste sources naming + select cutover
1. `select-formation-source` → API `waste-sources` (rename feature → `select-waste-source` желательно)
2. Page/route: канон `waste-sources` **или** оставить URL `formation-sources` + alias в docs (решение product)
3. Mock `formation-source` оставить только для POD-9 prototype до UIW
4. Поправить delete copy (SET NULL на UIW — когда появится; до этого — нейтральный текст)

### PR-D — Units tree invalidate + list UX parity
1. Invalidate `unitsQueryKeys.trees()` на create/update/delete
2. `isLoading` на wastes / waste-sources tables
3. Выравнять search controls (один variant)
4. Экспорт констант sort/limit из units public API как у остальных

### PR-E — FSD hard fixes (без новой фичи)
1. `UnitForm`: принимать `tenantId`/`enabled` пропсами, убрать `useTenant`
2. Вынести `DIRECTORY_CARDS` из pages в `shared/config` или `entities`/widgets
3. `create-operation` не импортирует pages store (или оставить до rewrite ops в new-features)

### PR-F — Docs sync
1. Обновить §0/§1 в `plan-existing-improvements.md`
2. Отметить waste-sources как сделанный cutover
3. Обновить units % и вычеркнуть закрытые P0
4. Cursor rule: «MDM directory slice checklist» (P1.5)

### Out of scope этого плана (→ new features)
- UIW bindings / реальные привязки waste↔unit↔instruction↔source
- POD-9 как backend entity
- Operations journal API
- Header instruction/period context
- RBAC `<Can>` на directory actions
- Toast infrastructure

---

## 4. Definition of Done (справочники)

Считаем справочники «приведены к правилам», когда:

- [ ] Смена tenant гарантированно чистит `["mdm"]` cache (тест)
- [ ] Ни одна MDM directory page не импортирует mock stores
- [ ] Все 4 справочника проходят checklist P1.5
- [ ] Select источников читает/пишет тот же API, что и страница справочника
- [ ] Units tree обновляется после upsert без reload
- [ ] Docs/matrix отражают фактический статус
- [ ] `tsc` + существующие unit tests green

---

## 5. Быстрый backlog (чеклист исполнения)

**Сейчас**
- [ ] P0.1 Tenant `removeQueries(["mdm"])`
- [ ] P0.2 Instructions delete без mock
- [ ] P0.4 Select → waste-sources API

**Следом**
- [ ] P1.3 Units `trees()` invalidate
- [ ] P1.6 `isLoading` + UX parity lists
- [ ] P1.1 Naming decision + rename/alias
- [ ] P1.4 cleanup-session refactor
- [ ] P1.2 FSD UnitForm / navigation

**Полировка**
- [ ] P2 orphan waste-detail
- [ ] P2 docs sync + rule checklist
- [ ] P2 dead options exports policy
