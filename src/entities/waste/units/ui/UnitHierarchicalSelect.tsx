import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AsyncCombobox, Badge } from "../../../../shared/ui";
import { useDebounce } from "../../../../shared/hooks";
import { getUnit } from "../api/get-unit";
import {
  flattenUnitTreePaths,
  unitTreeDepth,
  unitTreeDepthStyle,
} from "../model/flatten-unit-tree-paths";
import { unitsQueryKeys } from "../model/unit-query-keys";
import type { Unit } from "../model/units.types";
import { useUnitsTreeQuery } from "../model/use-units-tree-query";

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

function unitLabel(unit: Pick<Unit, "name" | "short_name">) {
  return unit.short_name ?? unit.name;
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
    items.map((item) => [item.unit.id, item.unit.is_pod9] as const),
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
      options={items.map((item) => ({
        value: item.unit.id,
        label: unitLabel(item.unit),
        disabled: excludedIds.has(item.unit.id),
        labelStyles: unitTreeDepthStyle(unitTreeDepth(item.path)),
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
