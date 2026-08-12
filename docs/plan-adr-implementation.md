# План реализации по ADR (обновлённый)

> Источник: `C:\Users\ChizhEM\eco-frontend-architecture.md` (актуальный ADR)  
> Backend: `mdm_*`, `classifiers_*`, `keycloak`, `tenants`, `users_me`, **`mdm_unit_instruction_wastes`**  
> Дата: 2026-08-11  
> Связанные: [`plan-directories-review.md`](./plan-directories-review.md), [`plan-existing-improvements.md`](./plan-existing-improvements.md)

**Scope этапа (строго по ADR §1 / §14):** auth, tenants, classifiers, MDM-справочники + **UIW bindings**.  
**Вне scope:** операции, остатки, паспорта, отчёты/Excel preview, воздух/вода. Существующие mock POD-9/ops — не развивать; вывести из основного пути.

---

## 0. Gap-анализ: ADR vs текущий код

| ADR требование | Сейчас | Gap |
|----------------|--------|-----|
| Keycloak + `/me` + tenants + persist | ✅ | Tenant cache clear сломан (§6 ADR) |
| Layout shell (sidebar/header) | ✅ частично | Нет `select-tenant` feature; header ≠ ADR naming `app/layouts` |
| Units tree CRUD | ✅ ~90% | Нет `is_pod9`; нет filter `is_pod9`; short_name write `""` vs null; нет invalidate trees; нет unit card + tabs |
| Instructions CRUD + statuses | ✅ | Mock delete-guard; activate flow можно явнее |
| MDM Wastes CRUD | ✅ | Mock `directory` рядом; UX parity |
| Waste Sources CRUD | ✅ | Naming `formation-*`; select на mock |
| **UIW bindings** | ❌ нет | Новый entity + UI на карточке unit |
| Classifier wastes select | ✅ | Admin CRUD page — опционально по роли |
| Region/district cascade | ✅ | — |
| Toast / API error body | ❌ / частично | ADR §5 / §12 |
| Zustand (tenant/sidebar) | ❌ context only | ADR §4 — можно отложить |
| FSD: `widgets/`, routes `/waste/*` | ❌ | Страницы в `directories/*`; widgets нет |
| Router split | ❌ монолит | ADR §10 + практический split |
| RBAC `<Can>` | helpers есть | Не используется |
| decimal.js для `transport_unit` | ❌ | Нужен для UIW |

**Вывод:** справочники MDM почти есть; следующий продуктовый блок — **bindings (UIW)** + **выравнивание под ADR** (routing IA, `is_pod9`, tenant cache, снятие mocks с critical path).

---

## 1. Целевая IA / routing (по ADR §10)

Переход с текущего `/directories/*` на канон ADR (с redirect-алиасами на переходный период):

```text
/                              → dashboard или redirect
/dashboard
/tenants/select                # если tenant не выбран

/waste/units
/waste/units/$unitId           # card: tabs instructions → bindings
/waste/units/new?parentId=
/waste/instructions
/waste/instructions/new
/waste/instructions/$instructionId
/waste/wastes
/waste/wastes/new
/waste/wastes/$wasteId
/waste/waste-sources

/classifiers/wastes            # optional admin

/settings/profile
/forbidden
```

**Убрать из основного меню (вне scope):** `/waste/operations`, `/reports/pod-9`, stub limits/norms, mock POD-9 structure routes.

Левое меню (ADR §8): Dashboard, Подразделения, Инструкции, Отходы, Источники образования, (Классификатор), Настройки, Выход.

---

## 2. Целевая FSD-раскладка (по ADR §5)

Не обязательно big-bang rename в одном PR. Двигаться инкрементально:

| Слой | Цель | Сейчас → |
|------|------|----------|
| `entities/waste/unit` | rename из `units` (опционально) | оставить `units` на этапе, alias export |
| `entities/waste/mdm-waste` | rename из `wastes` (опционально) | то же |
| `entities/waste/unit-instruction-waste` | **новый** | — |
| `entities/classifiers/*` | вынести из `entities/waste/*-classifier` | later |
| `widgets/waste/*-table` | вынести таблицы из pages | later / вместе с UI polish |
| `features/waste/bind-unit-instruction-waste` | **новый** | — |
| `features/select-tenant` | выделить из header | later |
| `app/router/` | split route modules | отдельный PR |
| `app/layouts/` | rename из `app/layout` | cosmetic |

Правило: **новые** слайсы сразу по ADR-именам; старые — rename отдельными PR без смешения с фичами.

---

## 3. Фазы реализации

### Фаза 0 — Фундамент (блокеры ADR §6 / тесты §15.8)

**Цель:** корректный tenant boundary и чистый MDM path.

| # | Задача | DoD |
|---|--------|-----|
| 0.1 | Смена tenant: `cancelQueries` + `removeQueries({ queryKey: ["mdm"] })` | Нет данных чужого tenant в UI; тест |
| 0.2 | `clearTenantState` / logout: clear MDM cache; не оставлять «один mock reset» | Session cleanup предсказуем |
| 0.3 | Убрать mock-guard с delete instructions | Нет импорта `directory` в instructions page |
| 0.4 | Units: invalidate `trees()` после create/update/delete | Tree обновляется без reload |
| 0.5 | Checklist слайса (Cursor rule / короткий md) | Новый MDM код проходит чеклист |

**Оценка:** 0.5–1 день.

---

### Фаза 1 — Довести MDM Units под ADR §7.3 / §8.2

| # | Задача | DoD |
|---|--------|-----|
| 1.1 | Добавить `is_pod9: boolean` в Read/Write types + form (switch) + badge в tree | Соответствует API |
| 1.2 | Filter `is_pod9` в tree/list (URL search) | Фильтр работает |
| 1.3 | `short_name`: empty → `null` в write body (не `""`) | Контракт optional/null |
| 1.4 | Убрать POD-9 mock из units UX/copy; mock routes — в «прототип» или скрыть | Units = только MDM hierarchy |
| 1.5 | Каркас страницы unit card `/waste/units/$unitId` (header + tabs placeholder) | Готово к UIW |

**Оценка:** 1–1.5 дня.

---

### Фаза 2 — IA / router под ADR §10

| # | Задача | DoD |
|---|--------|-----|
| 2.1 | Split `app/router.tsx` → `app/router/` + `lib/search-params.ts` | Монолит ≤ ~60 строк compose |
| 2.2 | Новые канонические paths `/waste/*` | Ссылки в sidebar/pages обновлены |
| 2.3 | Redirect со старых `/directories/*` | Старые bookmarks не ломаются |
| 2.4 | Route `/tenants/select` + guard «MDM требует tenant» | Пустой tenant → select, не half-broken MDM |
| 2.5 | Вычистить из nav out-of-scope пункты (ops/reports) или пометить hidden | Меню = ADR §8 |

**Оценка:** 1–1.5 дня.

---

### Фаза 3 — Waste sources naming + select cutover

| # | Задача | DoD |
|---|--------|-----|
| 3.1 | Route/page канон `waste-sources` (UI: «Источники образования») | Совпадает с ADR/API |
| 3.2 | Feature select на `useWasteSourcesOptions` + create API | Нет записи в mock store |
| 3.3 | Multi-select готовность к UIW (`waste_source_ids[]`) | Компонент принимает `string[]` |
| 3.4 | Mock `formation-source` только для legacy POD-9 или удалить | Нет dual write |

**Оценка:** 0.5–1 день.

---

### Фаза 4 — Unit–Instruction–Waste bindings (главная новая фича)

Backend: `mdm_unit_instruction_wastes.md`  
ADR: §7.7 / §8.6 / checklist §14.8

#### 4.1 Entity `entities/waste/unit-instruction-waste`

```text
api/
  paths.ts
  get-unit-instruction-wastes.ts
  get-unit-instruction-waste.ts
  create-unit-instruction-waste.ts
  update-unit-instruction-waste.ts
  delete-unit-instruction-waste.ts
model/
  uiw.types.ts
  uiw-query-keys.ts
  use-uiw-list-query.ts
index.ts
```

**Статус:** ✅ entity + list hook + UI section/modal на карточке unit `is_pod9` (2026-08-11).

#### 4.2 Feature `bind-unit-instruction-waste`

- ✅ Форма: existing MDM waste + multi-select sources + `transport_unit`
- ✅ Create / Patch / Delete + invalidate
- ✅ Запрет create waste из binding-формы (ссылка в справочник)

#### 4.3 Widget / page UI

- ✅ На карточке unit с `is_pod9`: секция привязок + фильтр инструкции (`?instructionId=`)
- ✅ После создания ПОД-9 — переход на карточку unit с секцией привязок

#### 4.4 Ошибки

- 409 duplicate → toast/callout  
- 422 transport_unit / validation → field errors  
- 404 → not found  

**Оценка:** 2.5–4 дня.

---

### Фаза 5 — Wastes / Instructions polish под ADR

| # | Задача |
|---|--------|
| 5.1 | Wastes/sources: `isLoading`, единый search UX |
| 5.2 | Instructions: явный activate/deactivate UX (если ещё размыт в одной форме) |
| 5.3 | После create waste — CTA «Перейти к привязке» (unit picker или deep-link на unit card) |
| 5.4 | Удалить orphan `waste-detail` / mock bindings UI |
| 5.5 | API error parsing (`detail` string/array) → field/toast (ADR §12) |

**Оценка:** 1 день.

---

### Фаза 6 — Classifiers & RBAC (ADR §8.7 / §13)

| # | Задача |
|---|--------|
| 6.1 | Решение product: CRUD classifiers только admin? |
| 6.2 | Если да — page `/classifiers/wastes` + `<Can>` |
| 6.3 | Operator: только select (уже есть) |
| 6.4 | Минимальная матрица `admin` / `operator` на destructive actions |

**Оценка:** 1–2 дня (после ответа на open questions).

---

### Фаза 7 — Shell / state / quality (ADR §4 / §9 / §15)

| # | Задача | Приоритет |
|---|--------|-----------|
| 7.1 | Toast infrastructure (sonner/shadcn) | P1 |
| 7.2 | Zustand для tenant/sidebar (опционально; сейчас Context ок) | P2 |
| 7.3 | Вынести tables в `widgets/waste/*` | P2 |
| 7.4 | Тесты ADR §15 (tenant switch, binding 409, waste classifier id≠code) | P1 |
| 7.5 | decimal.js + shared transport_unit schema | с фазой 4 |
| 7.6 | Docs sync: вычеркнуть out-of-scope из старых планов | P2 |

---

## 4. Рекомендуемый порядок PR

```text
PR0  Tenant cache + session + instructions mock-guard + units trees invalidate
PR1  Units is_pod9 + short_name null + unit card shell
PR2  Router split + /waste/* IA + redirects + nav cleanup
PR3  Waste-sources naming + API select (multi)
PR4a UIW entity + list query + keys
PR4b Bind feature (form + mutations)
PR4c Unit card tabs + bindings table UX
PR5  Wastes/instructions polish + API errors/toast
PR6  Classifiers admin page + Can (если product OK)
PR7  Tests critical path ADR §15
```

Каждый PR — зелёный `tsc` + ручной smoke по затронутому справочнику.  
Не смешивать UIW с rename FSD entities и с ops/reports.

---

## 5. Definition of Done этапа (ADR §14)

- [ ] 1–3: auth / me / tenants / shell  
- [ ] 4: Units tree CRUD + `is_pod9` + geo  
- [ ] 5: Instructions CRUD + statuses  
- [ ] 6: MDM Wastes CRUD via classifier id  
- [ ] 7: Waste Sources CRUD  
- [ ] 8: **UIW bindings** (existing waste only, M2M sources, transport_unit)  
- [ ] 9: Classifier select (+ CRUD by role)  
- [ ] 10: Region/district selects  
- [ ] Tenant switch clears MDM cache (тест)  
- [ ] Нет mock directory/formation на MDM critical path  
- [ ] Меню и routes соответствуют ADR scope (без ops/reports)

---

## 6. Сознательно НЕ делаем в этом этапе

- Журнал операций, остатки, лимиты, паспорта  
- Отчёты / POD-9 Excel preview  
- Развитие `structure.store` / mock POD-9 как продукта  
- Полный FSD rename всех слайсов в одном релизе  
- Wireframe «полный продукт» без актуализации документа  

---

## 7. Открытые вопросы (нужен ответ product)

Из ADR §17 + внедрение:

1. Матрица `admin` / `operator` по endpoint’ам?  
2. UI CRUD классификатора — всем или только admin?  
3. Persist tenant: sessionStorage (уже есть) — ок для prod?  
4. Стартовый экран после login: `/dashboard` или сразу `/waste/units`?  
5. Переименование URL сейчас или после UIW?

---

## 8. Быстрый старт (что делать первым)

1. **PR0** — tenant cache + mock isolation (разблокирует корректность всего MDM).  
2. **PR1** — `is_pod9` + unit card shell.  
3. **PR4*** — UIW (главная ценность ADR относительно текущего кода).  
4. Параллельно по возможности **PR2** (router) — не блокирует UIW, но упрощает рост.

---

## 9. Карта зависимостей

```text
PR0 (cache/mocks)
  ├─► PR1 (units is_pod9 + card shell)
  │     └─► PR4 (UIW на unit card)
  ├─► PR3 (sources multi-select) ──► PR4
  ├─► PR5 (errors/toast) ──► PR4 UX
  └─► PR2 (routes) — независимо, желательно до/с PR4 ссылками

PR6 RBAC — после product answers
PR7 tests — после PR0+PR4
```
