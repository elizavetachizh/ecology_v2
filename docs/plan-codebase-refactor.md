# План: код-ревью и декомпозиция существующего фронта

> **Частично устарело 2026-08-18.** Часть P0/P1 уже в коде (toast, StatusBadge, TenantRequiredGate, operations не mock). Архитектура: [`frontend-architecture.md`](./frontend-architecture.md).

> Дата: 2026-08-12  
> Фокус: **уже работающий** функционал (auth, tenants, MDM CRUD, classifiers, UIW) — не новые фичи.  
> Цель: уменьшить копипасту в pages, выровнять FSD, закрыть мелкие баги качества без переписывания доменов.  
> Связано: [`plan-adr-implementation.md`](./plan-adr-implementation.md), [`plan-directories-review.md`](./plan-directories-review.md) (частично устарел), backend `mdm_*` / `classifiers_*` / `keycloak` / `tenants`.

**Эталон слайса:** `entities/waste/instructions` + `features/waste/upsert-instruction` + list page с URL search.

---

## 0. Вердикт (актуальный код)

| Зона | Статус | Комментарий |
|------|--------|-------------|
| Auth Keycloak + `apiFetch` | Готово | PKCE, memory tokens, refresh |
| Tenant persist + cache wipe `["mdm"]` | Готово | `sessionStorage` + `removeQueries(["mdm"])` |
| Instructions / Units / Wastes / Waste-sources | API CRUD | Паттерн есть; pages жирные |
| UIW bindings | API + UI | `UnitInstructionWastesSection` ~325 строк — кандидат на split |
| Classifiers selects | Готово | Waste / region / district |
| Ops / POD-9 report / hub counts | Прототип на mock | Держать за boundary, не развивать в MDM-PR |
| `widgets/` слой | Нет | Таблицы/toolbars сидят в pages |
| Toast / StatusBadge / `<Can>` usage | Нет / unused | Инфра-долг |

Старые P0 из `plan-directories-review.md` (**tenant meta**, **mock delete-guard**, **formation-source select**, **trees invalidate**) в коде **уже закрыты**. Не тратить спринт на них повторно.

---

## 1. Матрица API ↔ фронт (существующее)

| Backend doc | Фронт | Gap рефакторинга (не фичи) |
|-------------|-------|----------------------------|
| `keycloak.md` / `users_me.md` | Auth + `/me` | Error UX / events polish |
| `tenants.md` | TenantProvider + header select | `clearTenantState` пустой; reset mock stores на смене tenant |
| `mdm_instructions.md` | Entity + list/form | List shell extract; ConfirmDialog pending bug |
| `mdm_units.md` | Tree + form + unit card | Columns/toolbar extract; copy про ПОД-9 |
| `mdm_wastes.md` | Catalog list/form | `isLoading`; shell extract |
| `mdm_waste_sources.md` | List + modal | Naming `formation-sources` vs API; `isLoading` |
| `mdm_unit_instruction_wastes.md` | Entity + section/modal | Split section; 409/422 UX |
| `classifiers_*.md` | Selects | Query-key factories; export retrieve helpers |
| Ops / POD-9 | Mock / harness | Out of scope этого плана |

---

## 2. Что вынести в компоненты / hooks / widgets

### 2.1. Повторяющийся каркас directory-list (P0, максимальный ROI)

Сейчас копируется в `instructions.tsx`, `wastes.tsx`, `waste-sources.tsx`, `structure.tsx`:

1. Tenant gate (`Alert` «Выберите организацию»)
2. Page header (title + description + CTA + «К справочникам»)
3. Search input + «Найти» + `patchSearch` + Enter
4. Error Alert
5. ConfirmDialog + delete mutation + invalidate

**Куда класть (зафиксировано, с учётом роста air/water):**

ADR: домены — группы `waste/` / `air-emissions/` / `water-discharges/`; платформа в корне слоя; `shared` — техника без бизнеса.  
«Справочники» / `directories` — UX-хаб и временные routes, **не** FSD-слайс и не имя для переиспользуемых UI.

```text
# ✅ платформенные примитивы (waste + будущие air/water)
shared/ui/
  tenant-required-gate.tsx     # TenantRequiredGate — любой tenant-scoped экран
  list-search-field.tsx        # ListSearchField — input + «Найти», без домена
  # Page header: НЕ плодить DirectoryPageHeader —
  # переиспользовать/расширить уже существующий PageContextBar

shared/lib/
  use-url-search-patch.ts      # TanStack navigate + reset offset (без waste)

# ❌ не класть
widgets/waste/...              # слишком узко — air/water не смогут reuse
widgets/directories/...        # «directories» исчезнет при IA /waste/*; нет домена directories в ADR
features/waste/...             # это не user-action feature
```

Составной layout (gate + header + children) — **только если** реально повторится 3+ раз с одинаковой склейкой:

```text
widgets/catalog/list-page-shell/   # нейтральное имя «catalog/справочник», не waste
```

До появления air/water достаточно примитивов из `shared/ui` + склейка в `pages`.

Pages оставляют только: `listParams`, `columns`, domain filters, entity hooks.

### 2.2. Колонки и page-модули (P1)

Не обязательно сразу `widgets/`. Минимум — colocated modules рядом со страницей:

```text
pages/dashboard/directories/instructions/
  InstructionsPage.tsx
  instructions-columns.tsx
  instructions-filters.tsx

pages/dashboard/directories/wastes/
  WastesDirectoryPage.tsx
  wastes-columns.tsx
  wastes-filters.tsx

# аналогично structure/, waste-sources/
```

Критерий: page-файл ≤ ~120–150 строк склейки.

### 2.3. UIW section split (P1)

`UnitInstructionWastesSection.tsx` (~325) →:

```text
features/waste/bind-unit-instruction-waste/ui/
  UnitInstructionWastesSection.tsx   # orchestration
  UiwInstructionTabs.tsx
  uiw-bindings-columns.tsx
  DetachUiwDialog.tsx                # или reuse ConfirmDialog wrapper
  BindUiwModal.tsx                   # уже есть
```

### 2.4. Router search validators (P1)

`app/router.tsx` (~329) дублирует `validateSearch` (q/sort/order/limit/offset).

```text
app/router/
  index.ts                 # compose routes
  search-params.ts         # shared parsers
  routes/directories.ts
  routes/waste.ts          # later IA
```

### 2.5. Shared missing UI (P1–P2)

| Компонент | Зачем |
|-----------|--------|
| `StatusBadge` | instructions status + ops later |
| Toast (sonner) | success/error после mutate; 409 UIW |
| `FieldLabel` rename file `field-lavel` → `field-label` | гигиена |
| Pending-aware ConfirmDialog usage | единый `isPending` на delete |

---

## 3. Баги / несогласованности в готовом функционале

| # | Проблема | Где | Фикс |
|---|----------|-----|------|
| B1 | Wastes / waste-sources таблицы без `isLoading` | `wastes.tsx`, `waste-sources.tsx` | Передать `isLoading={loading}` как у instructions |
| B2 | ConfirmDialog instructions: `confirmDisabled={deletingInstruction !== null}` | `instructions.tsx` | Disabled только на `deleteMutation.isPending` |
| B3 | Search button variant drift (`outline` vs `secondary`) | list pages | Один variant в `DirectorySearchField` |
| B4 | Hub counts статичны | `directories.mock.ts` | Убрать цифры или грузить `total` с API |
| B5 | `shared/config/navigation` → `pages/.../directories.mock` | FSD | Перенести `DIRECTORY_CARDS` в `shared/config` |
| B6 | `CreateOperationModal` → `useTenant` из app | FSD | Проп `tenantId` с page |
| B7 | Смена tenant не reset’ит mock ops/`structure.store` | TenantProvider / clearTenantState | `resetPrototypeStores()` рядом с ops, не в `shared/auth` |
| B8 | Copy wastes всё ещё про «журналы ПОД-9» как будто это MDM | `wastes.tsx` | Нейтральный текст: catalog → UIW на unit card |

---

## 4. FSD-правила (зафиксировать чеклистом)

```text
pages → widgets → features → entities → shared
app может вниз; слайсы одного слоя не импортируют друг друга
```

**Запрещено в MDM path:**

- импорт `structure.store` / ops mocks из directory pages/features
- `features` → `app/providers` (tenant/auth — пропсами или тонким hook только в pages)
- `shared` → `pages`

**Checklist MDM-слайса (повторять для каждого справочника):**

1. Types = backend Read/Write  
2. Query keys + `tenantId` + `enabled: !!tenantId`  
3. List hook ≠ options hook  
4. Page: gate, URL search, pagination, `isLoading`  
5. Upsert: RHF+Zod, invalidate lists(+trees)+details  
6. Delete: ConfirmDialog + `isPending`  
7. Public `index.ts` только публичный контракт  
8. Нет импортов из prototype mocks  

---

## 5. Порядок работ (только существующее)

```text
PR-R1  Shared list primitives
       TenantRequiredGate + DirectoryPageHeader + DirectorySearchField
       + useUrlSearchPatch
       Применить на instructions → wastes → waste-sources → structure

PR-R2  Quick fixes
       isLoading wastes/sources; ConfirmDialog pending;
       copy wastes; search variant; field-label rename

PR-R3  FSD hard fixes
       DIRECTORY_CARDS → shared/config
       CreateOperationModal tenantId prop
       clearTenantState / prototype reset на смене tenant

PR-R4  Split fat UI
       instructions/wastes/structure columns modules
       UnitInstructionWastesSection → tabs/columns/dialog
       router search-params helper (+ optional split)

PR-R5  Infra polish
       Toast + API error detail parsing
       StatusBadge
       (опц.) widgets/waste/*-table после стабилизации shell

PR-R6  Docs sync
       Вычеркнуть закрытые P0 в plan-directories-review / plan-existing-improvements
       Ссылка на этот документ как source of truth по рефакторингу
```

**Не смешивать** с: ops journal API, balances, POD-10, admin classifier CRUD, big-bang rename `/directories` → `/waste` (это ADR IA — отдельный трек в `plan-adr-implementation.md`).

---

## 6. Definition of Done

- [ ] Directory list pages используют общий gate/header/search; копипаста ≤ колонки + filters  
- [ ] Wastes / waste-sources показывают loading state  
- [ ] Delete confirm не «залипает» disabled  
- [ ] Нет `shared → pages` и `features → app` на критичном path  
- [ ] UIW section разбит на ≥3 файла без изменения UX  
- [ ] Prototype (ops/structure.store) явно изолирован; MDM pages не импортируют его  
- [ ] `tsc` + существующие unit tests green  

---

## 7. Оценка

| PR | Effort |
|----|--------|
| R1 | 0.5–1 д |
| R2 | 0.25 д |
| R3 | 0.5 д |
| R4 | 1–1.5 д |
| R5 | 0.5–1 д |
| R6 | 0.25 д |

Итого ориентир: **3–5 дней** чистого рефакторинга без новых продуктовых фич.

---

## 8. Открытые product-вопросы (не блокеры рефакторинга)

1. Route `formation-sources` → rename `waste-sources` или оставить alias?  
2. Когда убирать ops/POD-9 из меню (скрывать vs «Скоро»)?  
3. Список ролей для `<Can>` на destructive actions?
