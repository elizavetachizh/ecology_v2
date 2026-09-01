import { routes } from "../../../../shared/config/routes";
import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { UnitInstructionWaste } from "../../../../entities/waste/unit-instruction-waste";
import {
  HAZARD_CLASS_LABEL,
  UOM_LABEL,
  wasteLabel,
  type WasteBrief,
} from "../../../../entities/waste/wastes";
import { cn } from "../../../../shared/lib/cn";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "../../../../shared/ui";

type OperationWastePickerProps = {
  unitId: string;
  instructionId: string;
  tenantId?: string | null;
  items: UnitInstructionWaste[];
  total: number;
  loading: boolean;
  error: Error | null;
  value: string;
  onChange: (wasteId: string) => void;
  selectedWaste?: WasteBrief | null;
  disabled?: boolean;
  errorMessage?: string;
};

function UnitCardLink({
  unitId,
  instructionId,
  tenantId,
}: {
  unitId: string;
  instructionId: string;
  tenantId?: string | null;
}) {
  return (
    <Link
      to={routes.directories.units.detail}
      params={{ unitId }}
      search={{
        instructionId,
        ...(tenantId ? { tenant: tenantId } : {}),
      }}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      Открыть место учёта
    </Link>
  );
}

export function OperationWastePicker({
  unitId,
  instructionId,
  tenantId,
  items,
  total,
  loading,
  error,
  value,
  onChange,
  selectedWaste,
  disabled = false,
  errorMessage,
}: OperationWastePickerProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter((item) => {
      const classifier = item.waste.waste_classifier;
      return `${classifier.code} ${classifier.name}`
        .toLowerCase()
        .includes(query);
    });
  }, [items, query]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Загрузка отходов…</p>;
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить отходы</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (items.length === 0) {
    return (
      <Alert variant="info">
        <AlertTitle>Нет привязанных отходов</AlertTitle>
        <AlertDescription>
          Привяжите отходы к этой инструкции на карточке места учёта.{" "}
          <UnitCardLink
            unitId={unitId}
            instructionId={instructionId}
            tenantId={tenantId}
          />
        </AlertDescription>
      </Alert>
    );
  }

  const selectedFromList = items.find((item) => item.waste_id === value);
  const preview = selectedFromList?.waste ?? selectedWaste ?? null;

  return (
    <Field>
      <FieldLabel htmlFor="operation-wastes" required>
        Отход
      </FieldLabel>
      {items.length > 5 ? (
        <Input
          id="operation-waste-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Фильтр по коду или названию"
          disabled={disabled}
          aria-label="Фильтр отходов"
        />
      ) : null}
      <div
        id="operation-wastes"
        role="radiogroup"
        aria-label="Отход"
        className="grid max-h-96 gap-1.5 overflow-y-auto"
      >
        {filtered.map((item) => {
          const checked = item.waste_id === value;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => onChange(item.waste_id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                checked
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent",
                disabled && "opacity-50",
              )}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-medium">{wasteLabel(item.waste)}</span>
                <span className="text-xs text-muted-foreground">
                  {HAZARD_CLASS_LABEL[item.waste.hazard_class]} ·{" "}
                  {UOM_LABEL[item.waste.uom]}
                </span>
              </span>
              {checked ? (
                <Check
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <FieldDescription>Ничего не найдено. Уточните фильтр.</FieldDescription>
      ) : null}
      <FieldDescription>
        Нет нужного отхода? Проверьте привязки на карточке места учёта.{" "}
        <UnitCardLink
          unitId={unitId}
          instructionId={instructionId}
          tenantId={tenantId}
        />
      </FieldDescription>
      {total > items.length ? (
        <FieldDescription>
          Показаны первые {items.length} из {total}.
        </FieldDescription>
      ) : null}
      {preview && selectedFromList ? null : preview ? (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          <div className="font-medium">{wasteLabel(preview)}</div>
          <div className="text-muted-foreground">
            {HAZARD_CLASS_LABEL[preview.hazard_class]} ·{" "}
            {UOM_LABEL[preview.uom]}
          </div>
        </div>
      ) : null}
      <FieldError>{errorMessage}</FieldError>
    </Field>
  );
}
