import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { UnitInstructionWaste } from "../../../../entities/waste/unit-instruction-waste";
import {
  HAZARD_CLASS_LABEL,
  UOM_LABEL,
  wasteLabel,
  type WasteBrief,
} from "../../../../entities/waste/wastes";
import { routes } from "../../../../shared/config/routes";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AsyncCombobox,
  FormField,
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

function wasteOptionLabel(waste: WasteBrief) {
  return `${wasteLabel(waste)} (${HAZARD_CLASS_LABEL[waste.hazard_class]} · ${UOM_LABEL[waste.uom]})`;
}

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
    return items.filter((item) =>
      wasteOptionLabel(item.waste).toLowerCase().includes(query),
    );
  }, [items, query]);

  const selectedFromList = items.find((item) => item.waste_id === value);
  const preview = selectedFromList?.waste ?? selectedWaste ?? null;
  const selectedLabel = preview ? wasteOptionLabel(preview) : undefined;

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить отходы</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!loading && items.length === 0) {
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

  return (
    <FormField
      htmlFor="waste_id"
      required
      label="Отход"
      error={errorMessage}
      description={
        <>
          Нет нужного отхода? Проверьте привязки на карточке места учёта.{" "}
          <UnitCardLink
            unitId={unitId}
            instructionId={instructionId}
            tenantId={tenantId}
          />
          {total > items.length
            ? ` Показаны первые ${items.length} из ${total}.`
            : null}
        </>
      }
    >
      <AsyncCombobox
        options={filtered.map((item) => ({
          value: item.waste_id,
          label: wasteOptionLabel(item.waste),
        }))}
        value={value}
        selectedLabel={selectedLabel}
        onValueChange={onChange}
        placeholder="Выберите отход…"
        searchPlaceholder="Поиск по коду или названию"
        emptyMessage={
          loading
            ? "Загрузка…"
            : query
              ? "Ничего не найдено"
              : "Нет привязанных отходов"
        }
        search={search}
        setSearch={setSearch}
        className="w-full"
        contentClassName="w-full"
        aria-label="Отход"
        disabled={disabled || loading}
      />
    </FormField>
  );
}
