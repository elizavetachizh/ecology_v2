import { useQuery } from "@tanstack/react-query";
import {
  getUnit,
  unitsQueryKeys,
  useUnitsOptions,
  type Unit,
} from "../../../../entities/waste/units";
import { AsyncCombobox } from "../../../../shared/ui";

type PassportUnitSelectProps = {
  tenantId: string | null;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (id: string) => void;
};

function unitLabel(unit: Pick<Unit, "name" | "short_name">) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

export function PassportUnitSelect({
  tenantId,
  value,
  disabled,
  placeholder = "Выберите структурную единицу",
  onChange,
}: PassportUnitSelectProps) {
  const units = useUnitsOptions({
    tenantId,
    enabled: Boolean(tenantId),
  });

  const selectedQuery = useQuery({
    queryKey: unitsQueryKeys.detail(tenantId ?? "none", value || "none"),
    queryFn: ({ signal }) => getUnit(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const selected =
    units.options.find((item) => item.id === value) ??
    (selectedQuery.data?.id === value ? selectedQuery.data : null);

  return (
    <AsyncCombobox
      options={units.options.map((item) => ({
        value: item.id,
        label: unitLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? unitLabel(selected) : undefined}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Поиск по названию или краткому"
      emptyMessage={units.loading ? "Загрузка…" : "Ничего не найдено"}
      search={units.search}
      setSearch={units.setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label="Структурная единица"
    />
  );
}
