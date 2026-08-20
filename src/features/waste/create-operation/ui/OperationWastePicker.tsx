import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { UnitInstructionWaste } from "../../../../entities/waste/unit-instruction-waste";
import {
  HAZARD_CLASS_LABEL,
  UOM_LABEL,
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

function wasteLabel(waste: Pick<WasteBrief, "waste_classifier">) {
  return `${waste.waste_classifier.code} — ${waste.waste_classifier.name}`;
}

export function OperationWastePicker({
  unitId,
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
      return `${classifier.code} ${classifier.name}`.toLowerCase().includes(
        query,
      );
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
          <Link
            to="/directories/units/$unitId"
            params={{ unitId }}
            search={{ instructionId: undefined }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Открыть место учёта
          </Link>
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
        className="grid max-h-64 gap-1.5 overflow-y-auto"
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
                "flex w-full flex-col gap-0.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                checked
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent",
                disabled && "opacity-50",
              )}
            >
              <span className="font-medium">{wasteLabel(item.waste)}</span>
              <span className="text-xs text-muted-foreground">
                {HAZARD_CLASS_LABEL[item.waste.hazard_class]} ·{" "}
                {UOM_LABEL[item.waste.uom]}
              </span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <FieldDescription>Ничего не найдено. Уточните фильтр.</FieldDescription>
      ) : null}
      {total > items.length ? (
        <FieldDescription>
          Показаны первые {items.length} из {total}.
        </FieldDescription>
      ) : null}
      {preview && selectedFromList ? null : preview ? (
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          <div className="font-medium">{wasteLabel(preview)}</div>
          <div className="text-muted-foreground">
            {HAZARD_CLASS_LABEL[preview.hazard_class]} · {UOM_LABEL[preview.uom]}
          </div>
        </div>
      ) : null}
      <FieldError>{errorMessage}</FieldError>
    </Field>
  );
}
