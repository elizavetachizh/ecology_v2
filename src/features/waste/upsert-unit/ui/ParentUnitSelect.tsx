import { useQuery } from "@tanstack/react-query";
import {
  getUnit,
  useUnitsOptions,
  unitsQueryKeys,
  type Unit,
} from "../../../../entities/waste/units";
import { AsyncCombobox } from "../../../../shared/ui";

type ParentUnitSelectProps = {
  tenantId: string | null;
  value: string;
  /** Текущая единица (edit) — нельзя выбрать себя родителем. */
  excludeUnitId?: string;
  /** Для ПОД-9 родитель обязателен — меняем placeholder. */
  required?: boolean;
  onChange: (unit: Unit | null) => void;
};

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
  const selectedLabel =
    filtered.find((unit) => unit.id === value)?.name ??
    parentDetailQuery.data?.name;

  return (
    <AsyncCombobox
      options={filtered.map((unit) => ({
        value: unit.id,
        label: unit.short_name
          ? `${unit.name} (${unit.short_name})`
          : unit.name,
      }))}
      value={value}
      selectedLabel={selectedLabel}
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
