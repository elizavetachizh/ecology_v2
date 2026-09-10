import { useQuery } from "@tanstack/react-query";
import {
  getUnit,
  unitsQueryKeys,
  type Unit,
  useUnitsTreeQuery,
  type UnitTree,
} from "../../../../entities/waste/units";
import { AsyncCombobox, Badge } from "../../../../shared/ui";
import { useMemo, useState } from "react";
import { useDebounce } from "../../../../shared/hooks";

export function flattenTree(
  nodes: UnitTree[],
  parentPath: string[] = [],
): {
  id: string;
  name: string;
  short_name: string | null;
  is_pod9?: boolean;
  path: string[];
}[] {
  let result: {
    id: string;
    name: string;
    short_name: string | null;
    is_pod9?: boolean;
    path: string[];
  }[] = [];
  for (const node of nodes) {
    const path = [...parentPath, node.name];
    result.push({
      id: node.id,
      name: node.name,
      short_name: node.short_name,
      is_pod9: node.is_pod9,
      path,
    });
    if (node.children && node.children.length) {
      result = result.concat(flattenTree(node.children, path));
    }
  }
  return result;
}

type ParentUnitSelectProps = {
  tenantId: string | null;
  value: string;
  /** Текущая единица (edit) — нельзя выбрать себя родителем. */
  excludeUnitId?: string;
  is_pod9?: boolean;
  /** Для ПОД-9 родитель обязателен — меняем placeholder. */
  required?: boolean;
  onChange: (unit: Unit | null) => void;
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
  is_pod9 = false,
  required = false,
  onChange,
}: ParentUnitSelectProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const listParams = {
    search: debouncedSearch || undefined,
    limit: 20,
    offset: 0,
    is_pod9,
  };

  const { tree, loading } = useUnitsTreeQuery({
    tenantId,
    enabled: Boolean(tenantId),
    params: listParams,
  });

  // Плоский список всех узлов с путями
  const flatItems = useMemo(() => {
    if (!tree) return [];
    return flattenTree(tree);
  }, [tree]);

  const parentDetailQuery = useQuery({
    queryKey: unitsQueryKeys.detail(tenantId ?? "none", value || "none"),
    queryFn: ({ signal }) => getUnit(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const filtered = flatItems.filter((unit) => unit.id !== excludeUnitId);
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
        labelStyles: { marginLeft: `${unit.path.length}rem` },
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
