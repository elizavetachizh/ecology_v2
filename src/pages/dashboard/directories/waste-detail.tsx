import {
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { findInstruction } from "../../../entities/regulatory-document";
import {
  emptyPod9Form,
  POD9_STATUS_OPTIONS,
} from "../../../features/directories/create-structure-node";
import { FormationSourceSelect } from "../../../features/waste/select-formation-source";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  PageContextBar,
  Select,
} from "../../../shared/ui";
import {
  addWasteBinding,
  findWaste,
  formatBindingLabels,
  getPod9WastesSnapshot,
  getWasteBindings,
  HAZARD_CLASS_OPTIONS,
  removeWasteBinding,
  subscribeWastes,
  updateWaste,
  WASTE_UNIT_OPTIONS,
  type WasteBinding,
  type WasteFormValues,
} from "../../../entities/waste/directory";
import {
  getStructureTree,
  getUnitPod9Children,
  insertPod9,
  listStructureUnits,
  subscribeStructure,
} from "./model/structure.store";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

type NewPod9Draft = {
  name: string;
  period: string;
  status: string;
  responsible: string;
};

function emptyNewPod9Draft(): NewPod9Draft {
  const base = emptyPod9Form();
  return {
    name: base.name,
    period: base.period,
    status: base.status,
    responsible: base.responsible,
  };
}

function BindingCard({
  binding,
  onRemove,
}: {
  binding: WasteBinding;
  onRemove: () => void;
}) {
  const { unitLabel, pod9Label, sourceLabel } = formatBindingLabels(binding);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-background p-3">
      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-3">
        <div>
          <div className="text-xs text-muted-foreground">
            Структурная единица
          </div>
          <Link
            to="/directories/structure/units/$unitId"
            params={{ unitId: binding.unitId }}
            className="text-sm font-medium hover:underline"
          >
            {unitLabel}
          </Link>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Журнал ПОД-9</div>
          <Link
            to="/directories/structure/pod9/$pod9Id"
            params={{ pod9Id: binding.pod9Id }}
            search={{ instructionId: binding.instructionId }}
            className="text-sm font-medium hover:underline"
          >
            {pod9Label}
          </Link>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">
            Источник образования
          </div>
          <div className="text-sm font-medium">{sourceLabel}</div>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Удалить привязку"
        onClick={onRemove}
      >
        <Trash2 className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

export function WasteDetailPage() {
  const navigate = useNavigate();
  const { wasteId } = useParams({ from: "/directories/wastes/$wasteId" });
  const search = useSearch({ from: "/directories/wastes/$wasteId" });

  useSyncExternalStore(subscribeStructure, getStructureTree, getStructureTree);
  useSyncExternalStore(
    subscribeWastes,
    getPod9WastesSnapshot,
    getPod9WastesSnapshot,
  );

  const waste = findWaste(wasteId);
  const instruction = waste ? findInstruction(waste.instructionId) : null;
  const bindings = getWasteBindings(wasteId, waste?.instructionId);
  const units = listStructureUnits();

  const [form, setForm] = useState<WasteFormValues | null>(null);
  const [fieldsError, setFieldsError] = useState<string | null>(null);
  const [fieldsSaved, setFieldsSaved] = useState(false);
  const [fieldsPending, setFieldsPending] = useState(false);

  const [unitId, setUnitId] = useState("");
  const [pod9Id, setPod9Id] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [createPod9Mode, setCreatePod9Mode] = useState(false);
  const [pod9Draft, setPod9Draft] = useState<NewPod9Draft>(emptyNewPod9Draft);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(Boolean(search.created));

  const wasteForm =
    form ??
    (waste
      ? {
          classifierId: waste.classifierId,
          code: waste.code,
          name: waste.name,
          hazardClass: waste.hazardClass,
          unit: waste.unit,
        }
      : null);

  const pod9Options = useMemo(() => {
    if (!unitId) return [];
    return getUnitPod9Children(unitId);
  }, [unitId]);

  const noPod9ForUnit = Boolean(unitId) && pod9Options.length === 0;

  if (!waste || !wasteForm) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Alert variant="error">
          <AlertDescription>Отход не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link
            to="/directories/wastes"
            search={{ instructionId: search.instructionId }}
          >
            К отходам
          </Link>
        </Button>
      </div>
    );
  }

  const updateField = <K extends keyof WasteFormValues>(
    key: K,
    value: WasteFormValues[K],
  ) => {
    setForm((prev) => ({
      ...(prev ?? {
        classifierId: waste.classifierId,
        code: waste.code,
        name: waste.name,
        hazardClass: waste.hazardClass,
        unit: waste.unit,
      }),
      [key]: value,
    }));
    setFieldsError(null);
    setFieldsSaved(false);
  };

  const handleSaveFields = (event: FormEvent) => {
    event.preventDefault();

    if (!wasteForm.name.trim()) {
      setFieldsError("Укажите наименование отхода");
      return;
    }

    setFieldsPending(true);
    try {
      updateWaste(wasteId, wasteForm);
      setForm(wasteForm);
      setFieldsSaved(true);
      setFieldsPending(false);
    } catch {
      setFieldsError("Не удалось сохранить отход");
      setFieldsPending(false);
    }
  };

  const resetBindingForm = () => {
    setUnitId("");
    setPod9Id("");
    setSourceId("");
    setCreatePod9Mode(false);
    setPod9Draft(emptyNewPod9Draft());
    setError(null);
  };

  const handleAddBinding = (event: FormEvent) => {
    event.preventDefault();

    if (!unitId) {
      setError("Выберите структурную единицу");
      return;
    }
    if (!sourceId) {
      setError("Выберите или создайте источник образования");
      return;
    }
    let nextPod9Id = pod9Id;

    if (createPod9Mode) {
      if (
        !pod9Draft.name.trim() ||
        !pod9Draft.period.trim() ||
        !pod9Draft.responsible.trim()
      ) {
        setError("Заполните поля нового журнала ПОД-9");
        return;
      }
      const created = insertPod9({
        id: `pod9-${crypto.randomUUID().slice(0, 8)}`,
        name: pod9Draft.name.trim(),
        period: pod9Draft.period.trim(),
        status: pod9Draft.status.trim() || "Черновик",
        responsible: pod9Draft.responsible.trim(),
        parentId: unitId,
      });
      nextPod9Id = created.id;
    } else if (!nextPod9Id) {
      setError("Выберите журнал ПОД-9 или создайте новый");
      return;
    }

    const binding = addWasteBinding({
      wasteId,
      unitId,
      pod9Id: nextPod9Id,
      sourceId,
    });

    if (!binding) {
      setError("Такая привязка уже существует");
      return;
    }

    resetBindingForm();
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageContextBar
        eyebrow={`Справочники / Отходы / ${instruction?.number ?? "Инструкция"}`}
        title={wasteForm.name.trim() || "Отход"}
        description="Карточка вида отхода. Изменения полей и привязок выполняются ниже."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link
              to="/directories/wastes"
              search={{ instructionId: waste.instructionId }}
            >
              К отходам
            </Link>
          </Button>
        }
      />

      {search.created ? (
        <Alert variant="success">
          <AlertTitle>Отход создан в справочнике</AlertTitle>
          <AlertDescription>
            При необходимости отредактируйте поля ниже, затем добавьте привязки:
            структурная единица, журнал ПОД-9 и источник образования.
          </AlertDescription>
        </Alert>
      ) : null}

      <form
        onSubmit={handleSaveFields}
        className="grid gap-4 rounded-xl border border-border bg-card p-4 lg:grid-cols-2"
      >
        <div className="space-y-1 lg:col-span-2">
          <h2 className="font-semibold text-foreground">Данные отхода</h2>
          <p className="text-sm text-muted-foreground">
            Наименование, класс опасности и единица измерения. Источник
            образования задаётся при привязке к журналу ПОД-9.
          </p>
        </div>

        {fieldsError ? (
          <Alert variant="error" className="lg:col-span-2">
            <AlertDescription>{fieldsError}</AlertDescription>
          </Alert>
        ) : null}

        {fieldsSaved ? (
          <Alert variant="success" className="lg:col-span-2">
            <AlertDescription>Изменения сохранены.</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-name">Наименование</FieldLabel>
          <Input
            id="waste-name"
            value={wasteForm.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-hazard">Класс опасности</FieldLabel>
          <Select
            id="waste-hazard"
            value={wasteForm.hazardClass}
            onChange={(e) => updateField("hazardClass", e.target.value)}
          >
            {HAZARD_CLASS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-unit">Единица измерения</FieldLabel>
          <Select
            id="waste-unit"
            value={wasteForm.unit}
            onChange={(e) => updateField("unit", e.target.value)}
          >
            {WASTE_UNIT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-2">
          <Button type="submit" size="sm" disabled={fieldsPending}>
            {fieldsPending ? "Сохранение…" : "Сохранить изменения"}
          </Button>
        </div>
      </form>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <h2 className="font-semibold text-foreground">
              Структурные единицы и ПОД-9 согласно инструкции
            </h2>
            <p className="text-sm text-muted-foreground">
              Один отход может образовываться в нескольких структурных единицах,
              учитываться в нескольких ПОД-9 и иметь разные источники
              образования.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setShowForm(true);
              setError(null);
            }}
          >
            <Plus className="size-3.5" />
            Добавить привязку
          </Button>
        </div>

        {bindings.length === 0 ? (
          <Alert variant="info">
            <AlertTitle>Привязок пока нет</AlertTitle>
            <AlertDescription>
              Отход уже есть в справочнике, но ещё нигде не учитывается.
              Добавьте первую привязку: структурная единица → ПОД-9 → источник
              образования.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-2">
            {bindings.map((binding) => (
              <BindingCard
                key={binding.id}
                binding={binding}
                onRemove={() => removeWasteBinding(binding.id)}
              />
            ))}
          </div>
        )}

        {showForm ? (
          <form
            onSubmit={handleAddBinding}
            className="grid gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-3"
          >
            <div className="text-sm font-medium text-foreground">
              Новая привязка
            </div>
            <span className="text-xs text-muted-foreground">
              Привязка для инструкции:{" "}
              <strong className="font-medium text-foreground">
                {instruction?.number ?? "—"} —{" "}
                {instruction?.title ?? "Не найдена"}
              </strong>
            </span>

            {error ? (
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {units.length === 0 ? (
              <Alert variant="warning">
                <AlertTitle>Нет структурных единиц</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>Сначала создайте структурную единицу.</p>
                  <Button asChild size="sm">
                    <Link
                      to="/directories/structure/units/new"
                      search={{ parentId: "" }}
                    >
                      Создать структурную единицу
                    </Link>
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <FormationSourceSelect
                  id="bind-source"
                  value={sourceId}
                  onChange={(next) => {
                    setSourceId(next);
                    setError(null);
                  }}
                />

                <div className="grid gap-1.5">
                  <FieldLabel htmlFor="bind-unit">
                    Структурная единица
                  </FieldLabel>
                  <Select
                    id="bind-unit"
                    value={unitId}
                    onChange={(e) => {
                      setUnitId(e.target.value);
                      setPod9Id("");
                      setCreatePod9Mode(false);
                      setError(null);
                    }}
                  >
                    <option value="">Выберите единицу…</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                        {unit.code ? ` (${unit.code})` : ""}
                      </option>
                    ))}
                  </Select>
                </div>

                {unitId ? (
                  <div className="grid gap-1.5">
                    <FieldLabel htmlFor="bind-pod9">Журнал ПОД-9</FieldLabel>
                    <Select
                      id="bind-pod9"
                      value={pod9Id}
                      onChange={(e) => {
                        if (e.target.value === "__create__") {
                          setCreatePod9Mode(true);
                          setPod9Id("");
                          return;
                        }
                        setPod9Id(e.target.value);
                        setError(null);
                      }}
                    >
                      <option value="">Выберите ПОД-9…</option>
                      {pod9Options.map((pod9) => (
                        <option key={pod9.id} value={pod9.id}>
                          {pod9.name}
                          {pod9.period ? ` · ${pod9.period}` : ""}
                        </option>
                      ))}
                      <option value="__create__">+ Создать новый ПОД-9…</option>
                    </Select>
                  </div>
                ) : null}

                {unitId && createPod9Mode && !pod9Id ? (
                  <div className="grid gap-3 rounded-md border border-border bg-background p-3">
                    <Alert variant="info">
                      <AlertTitle>Новый журнал ПОД-9</AlertTitle>
                      <AlertDescription>
                        Создайте журнал — отход будет привязан к нему.
                      </AlertDescription>
                    </Alert>
                    <div className="grid gap-1.5">
                      <FieldLabel htmlFor="new-pod9-name">
                        Наименование
                      </FieldLabel>
                      <Input
                        id="new-pod9-name"
                        value={pod9Draft.name}
                        onChange={(e) =>
                          setPod9Draft((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <FieldLabel htmlFor="new-pod9-period">Период</FieldLabel>
                      <Input
                        id="new-pod9-period"
                        value={pod9Draft.period}
                        onChange={(e) =>
                          setPod9Draft((prev) => ({
                            ...prev,
                            period: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <FieldLabel htmlFor="new-pod9-responsible">
                        Ответственный
                      </FieldLabel>
                      <Input
                        id="new-pod9-responsible"
                        value={pod9Draft.responsible}
                        onChange={(e) =>
                          setPod9Draft((prev) => ({
                            ...prev,
                            responsible: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <FieldLabel htmlFor="new-pod9-status">Статус</FieldLabel>
                      <Select
                        id="new-pod9-status"
                        value={pod9Draft.status}
                        onChange={(e) =>
                          setPod9Draft((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      >
                        {POD9_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {!noPod9ForUnit ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCreatePod9Mode(false)}
                      >
                        Выбрать существующий ПОД-9
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={units.length === 0}>
                Сохранить привязку
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetBindingForm();
                  setShowForm(false);
                }}
              >
                Отмена
              </Button>
            </div>
          </form>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            void navigate({
              to: "/directories/wastes",
              search: { instructionId: waste.instructionId },
            })
          }
        >
          Готово
        </Button>
      </div>
    </div>
  );
}
