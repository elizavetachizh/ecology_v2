import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Input,
  Select,
} from "../../../shared/ui";
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
};

export function WasteCatalogForm({ mode, wasteId }: WasteCatalogFormProps) {
  const navigate = useNavigate();
  const existing = mode === "edit" && wasteId ? findWaste(wasteId) : null;

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

      const created = createWaste(form);
      void navigate({
        to: "/directories/wastes/$wasteId",
        params: { wasteId: created.id },
        search: { created: true },
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
          <Link to="/directories/wastes">К отходам</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {mode === "create" ? "Новый отход" : "Редактирование отхода"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Создайте отход в справочнике. После сохранения привяжите отход к
          структурным единицам и журналам ПОД-9.
        </p>
      </div>

      <Alert variant="info">
        <AlertTitle>Два шага</AlertTitle>
        <AlertDescription>
          1) Создайте отход в справочнике. 2) На карточке отхода добавьте
          привязки — один и тот же отход может образовываться в разных
          структурных единицах и учитываться в разных журналах ПОД-9.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4">
        {error ? (
          <Alert variant="error">
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
            <Link to="/directories/wastes/$wasteId" params={{ wasteId }}>
              Отмена
            </Link>
          </Button>
        ) : (
          <Button asChild type="button" variant="outline" disabled={pending}>
            <Link to="/directories/wastes">Отмена</Link>
          </Button>
        )}
      </div>
    </form>
  );
}

export function CreateWastePage() {
  return <WasteCatalogForm mode="create" />;
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
