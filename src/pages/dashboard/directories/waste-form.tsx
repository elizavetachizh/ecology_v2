import {type FormEvent, type ReactNode, useEffect, useState, useSyncExternalStore,} from "react";
import {Link, useNavigate, useParams, useSearch,} from "@tanstack/react-router";
import {getInstructions, subscribeInstructions,} from "../../../entities/regulatory-document";
import {Alert, AlertDescription, AlertTitle, Button, Input, PageContextBar, Select,} from "../../../shared/ui";
import {
  createWaste,
  emptyWasteForm,
  findWaste,
  HAZARD_CLASS_OPTIONS,
  updateWaste,
  WASTE_UNIT_OPTIONS,
  type WasteFormValues,
} from "./model/pod9-wastes.store";

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

type WasteCatalogFormProps = {
  mode: "create" | "edit";
  wasteId?: string;
  initialInstructionId?: string;
};

export function WasteCatalogForm({
  mode,
  wasteId,
  initialInstructionId,
}: WasteCatalogFormProps) {
  const navigate = useNavigate();
  const instructions = useSyncExternalStore(
    subscribeInstructions,
    getInstructions,
    getInstructions,
  );
  const existing = mode === "edit" && wasteId ? findWaste(wasteId) : null;
  const [instructionId, setInstructionId] = useState(
    existing?.instructionId ??
      initialInstructionId ??
      instructions[0]?.id ??
      "",
  );

  const [form, setForm] = useState<WasteFormValues>(() =>
    existing
      ? {
          name: existing.name,
          hazardClass: existing.hazardClass,
          unit: existing.unit,
          source: existing.source,
        }
      : emptyWasteForm(),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const update = <K extends keyof WasteFormValues>(
    key: K,
    value: WasteFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Укажите наименование отхода");
      return;
    }
    if (!form.source.trim()) {
      setError("Укажите источник образования");
      return;
    }
    if (!instructionId) {
      setError("Выберите инструкцию по обращению с отходами");
      return;
    }

    setPending(true);
    try {
      if (mode === "edit" && wasteId) {
        updateWaste(wasteId, form);
        void navigate({
          to: "/directories/wastes/$wasteId",
          params: { wasteId },
        });
        return;
      }

      const created = createWaste(form, instructionId);
      void navigate({
        to: "/directories/wastes/$wasteId",
        params: { wasteId: created.id },
        search: { created: true, instructionId },
      });
    } catch {
      setError("Не удалось сохранить отход");
      setPending(false);
    }
  };

  if (mode === "edit" && !existing) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert variant="error">
          <AlertDescription>Отход не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link
            to="/directories/wastes"
            search={{ instructionId: instructionId || undefined }}
          >
            К отходам
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
      <PageContextBar
        eyebrow="Справочники / Отходы"
        title={mode === "create" ? "Новый отход" : form.name || "Отход"}
        description="После сохранения отход можно привязать к структурным единицам и журналам ПОД-9."
        actions={
          <Select
            aria-label="Инструкция для отхода"
            value={instructionId}
            onChange={(event) => setInstructionId(event.target.value)}
            disabled={mode === "edit" || instructions.length === 0}
            className="w-80 max-w-full"
          >
            {instructions.length === 0 ? (
              <option value="">Сначала создайте инструкцию</option>
            ) : (
              instructions.map((instruction) => (
                <option key={instruction.id} value={instruction.id}>
                  {instruction.number} — {instruction.title}
                </option>
              ))
            )}
          </Select>
        }
      />

      <Alert variant="info">
        <AlertTitle>Два шага</AlertTitle>
        <AlertDescription>
          1) Создайте отход в справочнике. 2) На карточке отхода добавьте
          привязки — один и тот же отход может образовываться в разных
          структурных единицах и учитываться в разных журналах ПОД-9.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        {error ? (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-name">Наименование</FieldLabel>
          <Input
            id="waste-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-hazard">Класс опасности</FieldLabel>
          <Select
            id="waste-hazard"
            value={form.hazardClass}
            onChange={(e) => update("hazardClass", e.target.value)}
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
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
          >
            {WASTE_UNIT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="waste-source">Источник образования</FieldLabel>
          <Input
            id="waste-source"
            value={form.source}
            onChange={(e) => update("source", e.target.value)}
            placeholder="Типовой источник (уточняется в привязках)"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать отход"
              : "Сохранить"}
        </Button>
        {mode === "edit" && wasteId ? (
          <Button asChild type="button" variant="outline" disabled={pending}>
            <Link
              to="/directories/wastes/$wasteId"
              params={{ wasteId }}
              search={{ instructionId }}
            >
              Отмена
            </Link>
          </Button>
        ) : (
          <Button asChild type="button" variant="outline" disabled={pending}>
            <Link
              to="/directories/wastes"
              search={{ instructionId: instructionId || undefined }}
            >
              Отмена
            </Link>
          </Button>
        )}
      </div>
    </form>
  );
}

export function CreateWastePage() {
  const search = useSearch({ from: "/directories/wastes/new" });
  return (
    <WasteCatalogForm
      mode="create"
      initialInstructionId={search.instructionId}
    />
  );
}

export function EditWastePage() {
  const { wasteId } = useParams({ from: "/directories/wastes/$wasteId/edit" });
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({
      to: "/directories/wastes/$wasteId",
      params: { wasteId },
      replace: true,
    });
  }, [navigate, wasteId]);

  return null;
}
