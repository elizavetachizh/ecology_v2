# План новой функциональности

> То, чего **ещё нет** в продуктовом UI или нет готового backend-контракта в `eco-wastes-backend/docs`.  
> Не дублирует доработки уже начатых слайсов — они в [`plan-existing-improvements.md`](./plan-existing-improvements.md).  
> **Не изобретать велосипед:** те же FSD-слои, `apiFetch`/`apiJson`, TanStack Query, RHF+Zod, shared DataTable, паттерн `entities/*/api` как у instructions.

**Источники требований:** MVP ADR §18, wireframe §4–14, architecture domain model §7.

---

## 0. Карта покрытия MVP

| MVP (ADR §18) | Статус фронта | Backend docs | Документ |
|---------------|---------------|--------------|----------|
| 1. Каркас приложения | Есть | — | existing |
| 2. Layout меню + header | Есть (частично) | — | existing (header context) |
| 3. Выбор org + инструкции | Org есть; instruction context — нет | tenants, instructions | existing |
| 4. Справочник структурных единиц | Mock UI | `mdm_units` | **existing** (подключение API) |
| 5. Отходы + источники (dual entry) | Mock UI; модель ≠ API | wastes есть; sources **нет** | wastes → existing; sources/bindings → **здесь** |
| 6. Журнал операций | Mock | **нет** | **здесь** |
| 7. Мастер создания операции | Modal mock | **нет** | **здесь** |
| 8. Остатки и лимиты | Нет / stub | **нет** | **здесь** |
| 9. Архив отчётов | Нет | **нет** | **здесь** |
| 10. Формирование ПОД-9 | Preview harness | legacy `/api/w/pod-9/` | existing (форма) + **здесь** (мастер/архив) |
| 11. ПОД-10 | Nav dead link | **нет** | **здесь** |
| 12. 1-отходы | Nav dead link | **нет** | **здесь** |
| 13. Паспорта перевозки | Нет | **нет** | **здесь** |

Дополнительно из wireframe справочников: контрагенты, договоры, перевозчики, территориальная принадлежность (regions UI), лимиты, нормативы — **здесь**, пока нет API.

---

## 1. Принцип поставки новой функциональности

```text
1. Есть backend docs? → entity api/model + feature + page (как instructions)
2. Нет docs? → не выдумывать REST; либо:
   a) зафиксировать Open Question и ждать контракт
   b) временный UI-прототип на mock с явной пометкой «не production data»
3. Переиспользовать shared: DataTable, Modal, ConfirmDialog, async-combobox, api-client
4. Server state только TanStack Query; URL для фильтров; Zustand/context — только org/instruction/period
```

---

## 2. Платформенный контекст (новое поведение shell)

После доводки header (existing) — новые продуктовые правила:

### 2.1. Глобальный выбор инструкции

**Зачем (wireframe):** без инструкции часть операций/отходов недоступна.

**Сделать:**

- store/context: `selectedInstructionId`;
- header combobox (options hook уже есть);
- callout в рабочей области, если `null`:

> Выберите инструкцию по обращению с отходами, чтобы работать с отходами, лимитами и нормативами.

- features, завязанные на инструкцию, получают id из контекста (не копировать select в каждую страницу).

### 2.2. Глобальный период

Для dashboard, остатков, отчётов — один period в URL или app UI store (`from`/`to` или год).  
Страницы могут override локально, но default — из контекста.

### 2.3. Quick actions в header

- `+ Создать операцию` → открыть мастер (feature);
- `Сформировать отчет` → hub отчётов или последний тип.

---

## 3. Справочники — новое / нет API

### 3.1. Хаб справочников (доработка данных + новые карточки)

Сейчас карточки из `directories.mock` со статическими `count`/`fillStatus`.

**Новое:**

- counts с API (`total` из Page) где endpoints есть;
- карточки, которых нет в меню/хабе по wireframe:

| Справочник | Backend | Действие |
|------------|---------|----------|
| Территориальная принадлежность | classifiers regions/districts | Read-only browser или селекты только в Unit (минимум — не отдельный CRUD) |
| Лимиты накопления | нет | Stub → ждать API |
| Нормативы образования | нет | Stub (уже DirectoryStubPage) |
| Контрагенты | нет | Ждать API |
| Договоры | нет | Ждать API |
| Перевозчики | нет | Ждать API |
| Источники образования | нет | см. §3.3 |

Не плодить пустые CRUD-экраны «для галочки» без контракта.

### 3.2. Связи Waste ↔ Unit / Instruction / Source (bindings)

Wireframe + ADR: отход создаётся в каталоге и **в контексте структурной единицы**; источник — в справочнике и **inline** при отходе.

Текущий фронт уже набросал `WasteBinding` { instructionId, wasteId, unitId, pod9Id, sourceId } — **это фронтовая модель без backend docs**.

**План:**

1. Запросить у backend модель (отдельная таблица связей? поля на waste? POD-9 entity?).
2. После контракта — `entities/waste/...` + dual entry-points:
   - `features/waste/upsert-waste` (каталог);
   - `features/waste/create-waste-in-unit-context` (предзаполненный unitId);
   - `features/waste/create-generation-source` + inline nested form.
3. До контракта — не усложнять mock bindings; в existing-плане MDM waste без bindings.

### 3.3. Источники образования (`generation-source`)

UI mock есть (`formation-sources`). Backend docs в комплекте **нет**.

**Новое после API:**

```text
entities/waste/generation-source/
features/waste/upsert-generation-source/
features/waste/select-formation-source/  # уже есть UI — переключить на Query
```

Пока API нет — не подключать «фейковый REST».

### 3.4. Admin CRUD классификатора отходов (опционально)

API: полный CRUD `/api/v1/classifiers/wastes`.  
Для эколога организации обычно достаточно search-select (уже есть).

**Новый экран** — только если роль «админ классификаторов» / product запросил.  
Иначе — out of MVP эколога.

### 3.5. Карточка инструкции с вкладками (wireframe §6)

После появления связей wastes/limits/norms:

```text
pages/.../instruction-detail
  tabs: Общие | Отходы | Источники | Лимиты | Нормативы | Отчеты
widgets/waste/instruction-wastes-table  # nested DataTable, lazy on tab open
```

До API связей — не строить пустые вкладки.

---

## 4. Журнал операций и мастер

### 4.1. Зависимость

Нужен backend: операции CRUD, типы операций, статусы, расчёт остатка/лимита на проверке.  
В `docs/` backend этого **нет** → сначала контракт.

### 4.2. Целевой UX (wireframe §7–8, не менять)

**Журнал:** фильтры период / структурная единица / отход / тип; таблица; row actions (открыть, edit, copy, cancel, создать паспорт если вывоз).

**Мастер 4 шага** (уже набросан modal — переработать в полноценный wizard feature):

```text
1. Структурная единица (tree select из /mdm/units)
2. Отход (+ info: класс, uom, остаток, лимит; inline source)
3. Операция (дата, тип, количество, документ; блок вывоза)
4. Проверка (остаток до/после, лимит, заполненность, warnings)
```

Типы: образовалось / вывоз / передано / поступило.  
Статусы: проведена / черновик / требует проверки / ошибка.

### 4.3. FSD размещение

```text
entities/waste/operation/
features/waste/create-operation/     # расширить существующий modal → steps
features/waste/validate-operation/
widgets/waste/operations-journal/
pages/dashboard/waste/operations/
```

### 4.4. Пока нет API

Допустимо оставить mock journal **как кликабельный прототип**, но:

- не смешивать с реальными instruction/unit id без пометки;
- не показывать в production build как «учёт»;
- в меню можно оставить с badge «демо».

---

## 5. Остатки и лимиты

Wireframe §9. Маршрут `/waste/balances` сейчас 404.

**Новое после API:**

- KPI-карточки (общий остаток, виды, места, превышения);
- таблица с progress заполненности (цвет: ≤70 / 70–90 / 90–100 / >100);
- фильтр по дате + structural unit (+ «включая дочерние»);
- графики (Recharts/Nivo — в ADR, **ещё не в package.json** → добавить при первом экране с чартами).

Лимиты как справочник (`/directories/limits`) — отдельная сущность `accumulation-limit` (ADR); stub уже есть.

**Не делать:** свой расчёт остатков на фронте «вместо backend».

---

## 6. Паспорта перевозки

Wireframe §10. В навигации сейчас **нет** пункта (в wireframe левого меню — есть).

**Новое:**

```text
/waste/transport-passports
entities/waste/transport-passport/
features/waste/create-transport-passport/  # ручной + из операции вывоза
```

Зависимости: операции вывоза, контрагент, договор, перевозчик — тоже нужны API.

Добавить пункт в `navigationGroups`, когда появится хотя бы list API.

---

## 7. Отчёты — платформенный механизм

### 7.1. Архив отчётов (wireframe §11)

```text
/reports
features/generate-report/          # уже есть preview pipeline — расширить
entities/report/                   # archive list, download, regenerate
widgets/reports/archive-table/
```

Вкладки: Все / ПОД-9 / ПОД-10 / 1-отходы / Excel / PDF.  
Действия: открыть, скачать, повторить, удалить.

**Блокер:** нет docs archive API в текущем наборе backend docs.

### 7.2. Мастер ПОД-9 (wireframe §12)

Поверх существующего preview:

```text
Шаг 1 Параметры (period, org, instruction, unit/department, …)
Шаг 2 Проверка данных (warnings/errors)
Шаг 3 Предпросмотр (уже есть SheetJS table)
Шаг 4 Формирование (Excel/PDF) + сохранение в архив
```

Переиспользовать `features/generate-report` (`parseExcelPreview`, types).  
Когда backend даст JSON+base64 — добавить decoder рядом с blob adapter (architecture §13).

### 7.3. ПОД-10 и 1-отходы

Отдельные page adapters тех же шагов с разными param schemas и endpoints.  
Пока endpoints нет — не вешать битые ссылки в nav (см. existing).

### 7.4. Export таблицы журнала

`features/export-table` (ADR) — Excel текущего среза таблицы (клиентский SheetJS или backend).  
Делать после стабильного journal.

---

## 8. Главная панель (Dashboard)

Wireframe §4. Сейчас placeholder.

**Новое:**

```text
pages/dashboard/HomePage
widgets/waste/dashboard-kpis/
widgets/waste/recent-operations/
widgets/waste/warnings-panel/
widgets/waste/balances-charts/   # после API + recharts
```

KPI: операции за период, остаток, превышения, отчёты, ошибки данных.  
Быстрые действия: операция, ПОД-9/10, 1-отходы, добавить отход, добавить место (unit).

**Порядок:** после реальных ops/balances/reports хотя бы частично; иначе dashboard будет на моках и введёт в заблуждение.  
Промежуточно: dashboard со ссылками на готовые разделы (instructions, structure, wastes) + empty states.

---

## 9. Настройки организации / Помощь

Wireframe меню: Настройки организации, Помощь, Настройки.

**Новое минимально:**

- `/settings/organization` — read-only tenant info из `/tenants` + `/me`;
- Помощь — внешняя ссылка / markdown stub.

Не строить админку Keycloak на фронте.

---

## 10. UI-kit gaps для новых экранов

Появится по мере фич (не заранее «на вырост»):

| Компонент | Для чего |
|-----------|----------|
| DataTableTree (lazy children) | Большие деревья units |
| DataTableNested / Expand | Инструкция → отходы; операция → детали |
| Stepper / Wizard | Операция, отчёт |
| DateRangePicker | Период |
| Progress / Filledness cell | Остатки |
| StatusBadge | Операции, отчёты, инструкции |
| Toast | Уже в existing — нужен до первых мутаций new features |
| Charts (Recharts или Nivo) | Dashboard, остатки |
| decimal.js | Количества/остатки — когда появятся расчёты |
| TanStack Virtual | Длинные журналы |

Добавлять в `shared/ui` при первом потребителе.

---

## 11. Рекомендуемый roadmap новой функциональности

Зависит от готовности backend. Логический порядок продукта:

```text
Фаза A — MDM полный контур (после existing PR5–6)
  A1  Bindings waste↔unit↔instruction (когда API)
  A2  Generation sources CRUD + inline create
  A3  Instruction detail tabs

Фаза B — Учёт
  B1  Operations API contract + journal
  B2  Create operation wizard + validate
  B3  Balances + limits read models
  B4  Transport passports

Фаза C — Отчётность
  C1  Report archive API
  C2  POD-9 full wizard (validate → preview → archive)
  C3  POD-10, 1-waste adapters
  C4  Export journal

Фаза D — Обзор
  D1  Home dashboard KPIs/charts
  D2  Notifications (если будет API)

Фаза E — Расширение доменов (не MVP)
  air-emissions / water-discharges группы слайсов
```

Параллелить можно A∥ подготовка C2 (форма параметров POD-9 уже в existing).

---

## 12. Запросы к backend (нужны docs/endpoints)

Без этих контрактов фронт не должен «угадывать» модель:

1. **Operations** — CRUD, filters, statuses, link to unit/waste/instruction.
2. **Balances / limits / norms** — read models + rules превышения.
3. **Generation sources** — MDM CRUD.
4. **Waste bindings** / placement на structural unit + instruction.
5. **POD-9 entity** (если это не просто отчёт): связь с unit.
6. **Counterparties / contracts / carriers**.
7. **Transport passports**.
8. **Reports archive** + generate/download; preview JSON+base64 vs legacy blob.
9. **POD-10**, **1-waste** endpoints и params.
10. **Permissions** — финальные имена ролей для UI gates.

Рекомендация: каждый новый domain doc в `eco-wastes-backend/docs/` → сразу заводить `entities/.../api` по образцу instructions, без промежуточного глобального SDK.

---

## 13. Критерии «готово» для новой фичи (Definition of Done)

- [ ] Типы = backend Read/Write (не UI-only поля в api layer)
- [ ] `tenantScoped` + `tenantId` в queryKey
- [ ] Public API слайса через `index.ts`
- [ ] Нет импортов вверх по FSD / в `pages` из entities
- [ ] Loading / empty / error / 403 UX
- [ ] Мутации: invalidate + toast
- [ ] Права через `can` / `<Can>`, не хардкод строк в JSX
- [ ] Фильтры списка в URL
- [ ] Тесты на schema/mapper; smoke на hooks при сложной логике

---

## 14. Что не входит в ближайший scope

- Микрофронтенды / Next.js
- Offline очередь операций
- Полный Excel-like AG Grid (только если preview/матрица упрётся в TanStack Table)
- Домены воздух/вода (только зарезервировать папки групп, когда появятся)
- Контроль обучения и инструктажей (явно исключён wireframe §16)
