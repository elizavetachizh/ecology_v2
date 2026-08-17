import { useQuery } from "@tanstack/react-query";
import {
  getUnit,
  useUnitsOptions,
  unitsQueryKeys,
  type Unit,
} from "../../../../entities/waste/units";
import { AsyncCombobox, Badge } from "../../../../shared/ui";

type ParentUnitSelectProps = {
  tenantId: string | null;
  value: string;
  /** Текущая единица (edit) — нельзя выбрать себя родителем. */
  excludeUnitId?: string;
  /** Для ПОД-9 родитель обязателен — меняем placeholder. */
  required?: boolean;
  onChange: (unit: Unit | null) => void;
};

function unitLabel(unit: Pick<Unit, "name" | "short_name">) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

function renderUnitOption(
  option: { value: string; label: string },
  isPod9: boolean,
) {
  return (
    <>
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      {isPod9 ? (
        <Badge variant="info" className="shrink-0">
          ПОД-9
        </Badge>
      ) : null}
    </>
  );
}

export function ParentUnitSelect({
  tenantId,
  value,
  excludeUnitId,
  required = false,
  onChange,
}: ParentUnitSelectProps) {
  const { options, loading, search, setSearch } = useUnitsOptions({
    tenantId,
    limit: 20,
  });

  const parentDetailQuery = useQuery({
    queryKey: unitsQueryKeys.detail(tenantId ?? "none", value || "none"),
    queryFn: ({ signal }) => getUnit(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const filtered = options.filter((unit) => unit.id !== excludeUnitId);
  const selectedUnit =
    filtered.find((unit) => unit.id === value) ??
    (parentDetailQuery.data?.id === value ? parentDetailQuery.data : null);

  const isPod9ById = new Map(
    filtered.map((unit) => [unit.id, unit.is_pod9] as const),
  );
  if (selectedUnit) {
    isPod9ById.set(selectedUnit.id, selectedUnit.is_pod9);
  }

  return (
    <AsyncCombobox
      options={filtered.map((unit) => ({
        value: unit.id,
        label: unitLabel(unit),
      }))}
      value={value}
      selectedLabel={selectedUnit ? unitLabel(selectedUnit) : undefined}
      renderOption={(option) =>
        renderUnitOption(option, Boolean(isPod9ById.get(option.value)))
      }
      renderValue={(option) =>
        renderUnitOption(option, Boolean(isPod9ById.get(option.value)))
      }
      onValueChange={(id) => {
        if (!id) {
          onChange(null);
          return;
        }
        const item =
          filtered.find((unit) => unit.id === id) ??
          (parentDetailQuery.data?.id === id ? parentDetailQuery.data : null);
        onChange(item);
      }}
      placeholder={
        required
          ? "Выберите родительскую единицу…"
          : "Без родителя (корневая единица) или выберите…"
      }
      searchPlaceholder="Поиск по названию или краткому"
      emptyMessage={
        loading
          ? "Загрузка…"
          : "Ничего не найдено. Создайте родителя или уточните поиск."
      }
      className="w-full"
      contentClassName="w-full"
      search={search}
      setSearch={setSearch}
      aria-label="Родительская структурная единица"
    />
  );
}
