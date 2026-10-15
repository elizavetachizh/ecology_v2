import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AsyncCombobox } from "../../../../shared/ui";
import { useDebounce } from "../../../../shared/hooks";
import { getUnit } from "../api/get-unit";
import {
  flattenUnitTreePaths,
  unitComboboxOptions,
} from "../model/flatten-unit-tree-paths";
import { unitLabel } from "../model/unit-label";
import { unitsQueryKeys } from "../model/unit-query-keys";
import type { Unit } from "../model/units.types";
import { useUnitsTreeQuery } from "../model/use-units-tree-query";
import { UnitOptionContent } from "./UnitOptionContent";

type UnitHierarchicalSelectProps = {
  tenantId: string | null;
  value: string;
  /** Текущая единица (edit) — нельзя выбрать себя родителем. */
  excludeUnitId?: string;
  /** Уже выбранные единицы — нельзя добавить повторно. */
  excludeUnitIds?: readonly string[];
  /**
   * Фильтр как query `is_pod9` у GET /mdm/units:
   * не задан — всё дерево;
   * true — только места учёта ПОД-9;
   * false — без ПОД-9.
   */
  isPod9?: boolean;
  /** Для ПОД-9 родитель обязателен — меняем placeholder. */
  required?: boolean;
  "aria-label"?: string;
  onChange: (unit: Unit | null) => void;
  placeholder?: string;
};

export function UnitHierarchicalSelect({
  tenantId,
  value,
  excludeUnitId,
  excludeUnitIds,
  isPod9,
  required = false,
  "aria-label": ariaLabel = "Родительская структурная единица",
  onChange,
  placeholder,
}: UnitHierarchicalSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const pod9Only = isPod9 === true;
  const excludePod9 = isPod9 === false;

  const { tree, loading } = useUnitsTreeQuery({
    tenantId,
    enabled: Boolean(tenantId),
    params: {
      search: debouncedSearch || undefined,
      sort: "name",
      order: "asc",
      ...(isPod9 != null ? { is_pod9: isPod9 } : {}),
    },
  });

  const items = useMemo(
    () => flattenUnitTreePaths(tree, { excludePod9 }),
    [tree, excludePod9],
  );
  const unitOptions = useMemo(
    () => unitComboboxOptions(items, "tree"),
    [items],
  );

  const parentDetailQuery = useQuery({
    queryKey: unitsQueryKeys.detail(tenantId ?? "none", value || "none"),
    queryFn: ({ signal }) => getUnit(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const selectedFromTree = items.find((item) => item.unit.id === value);
  const selectedUnit =
    selectedFromTree?.unit ??
    (parentDetailQuery.data?.id === value ? parentDetailQuery.data : null);

  const isPod9ById = new Map(
    unitOptions.map((option) => [option.value, option.isPod9] as const),
  );
  if (selectedUnit) {
    isPod9ById.set(selectedUnit.id, selectedUnit.is_pod9);
  }

  const excludedIds = new Set([
    ...(excludeUnitId ? [excludeUnitId] : []),
    ...(excludeUnitIds ?? []),
  ]);

  return (
    <AsyncCombobox
      options={unitOptions.map((option) => ({
        value: option.value,
        label: option.label,
        disabled: excludedIds.has(option.value),
        labelStyles: option.labelStyles,
      }))}
      value={value}
      selectedLabel={selectedUnit ? unitLabel(selectedUnit) : undefined}
      renderOption={(option) => (
        <UnitOptionContent
          option={option}
          isPod9={Boolean(isPod9ById.get(option.value))}
        />
      )}
      renderValue={(option) => (
        <UnitOptionContent
          option={option}
          isPod9={Boolean(isPod9ById.get(option.value))}
        />
      )}
      onValueChange={(id) => {
        if (!id) {
          onChange(null);
          return;
        }
        const fromTree = items.find((item) => item.unit.id === id)?.unit;
        const fromDetail =
          parentDetailQuery.data?.id === id ? parentDetailQuery.data : null;
        onChange(fromTree ?? fromDetail);
      }}
      placeholder={
        pod9Only
          ? "Выберите место учёта…"
          : required
            ? "Выберите родительскую единицу…"
            : placeholder
              ? placeholder
              : "Все структурные единицы"
      }
      searchPlaceholder="Поиск по названию или краткому"
      emptyMessage={
        loading
          ? "Загрузка…"
          : pod9Only
            ? "Нет мест учёта ПОД-9. Добавьте место учёта в структуре организации."
            : "Ничего не найдено. Создайте родителя или уточните поиск."
      }
      className="w-full"
      contentClassName="w-full"
      search={search}
      setSearch={setSearch}
      aria-label={ariaLabel}
    />
  );
}
