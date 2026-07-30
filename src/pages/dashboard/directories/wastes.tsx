import { useMemo, useSyncExternalStore } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button, DataTable, type ColumnDef } from "../../../shared/ui";
import {
  formatBindingLabels,
  getPod9WastesSnapshot,
  getWasteBindings,
  getWastesSnapshot,
  subscribeWastes,
  type DirectoryWaste,
} from "./model/pod9-wastes.store";
import { getStructureTree, subscribeStructure } from "./model/structure.store";

export function WastesDirectoryPage() {
  useSyncExternalStore(subscribeStructure, getStructureTree, getStructureTree);
  const storeVersion = useSyncExternalStore(
    subscribeWastes,
    getPod9WastesSnapshot,
    getPod9WastesSnapshot,
  );
  const wastes = useMemo(() => getWastesSnapshot(), [storeVersion]);

  const columns = useMemo<ColumnDef<DirectoryWaste>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <Link
            to="/directories/wastes/$wasteId"
            params={{ wasteId: row.original.id }}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "hazardClass",
        header: "Класс опасности",
        cell: ({ row }) => row.original.hazardClass,
      },
      {
        accessorKey: "unit",
        header: "Ед. изм.",
        cell: ({ row }) => row.original.unit,
      },
      {
        accessorKey: "source",
        header: "Источник образования",
        cell: ({ row }) => row.original.source,
      },
      {
        id: "bindings",
        header: "Где образуется / ПОД-9",
        cell: ({ row }) => {
          const bindings = getWasteBindings(row.original.id);
          if (bindings.length === 0) {
            return (
              <span className="text-xs text-muted-foreground">
                Нет привязок
              </span>
            );
          }

          return (
            <div className="flex max-w-md flex-wrap gap-1.5">
              {bindings.map((binding) => {
                const { unitLabel, pod9Label } = formatBindingLabels(binding);
                return (
                  <span
                    key={binding.id}
                    className="inline-flex max-w-full flex-col rounded-md border border-border bg-muted/40 px-2 py-1 text-xs leading-tight"
                    title={`${unitLabel} → ${pod9Label}`}
                  >
                    <span className="truncate font-medium text-foreground">
                      {unitLabel}
                    </span>
                    <span className="truncate text-muted-foreground">
                      → {pod9Label}
                    </span>
                  </span>
                );
              })}
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Отходы
          </h1>
          <p className="text-sm text-muted-foreground">
            Создайте отход в справочнике, затем привяжите его к структурным
            единицам и журналам ПОД-9.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/directories/wastes/new">
              <Plus className="size-3.5" />
              Создать отход
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/directories">К справочникам</Link>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={wastes}
        getRowId={(row) => row.id}
        emptyTitle="Отходов пока нет"
        emptyDescription="Создайте отход в справочнике — привязки к единицам и ПОД-9 добавите после."
      />
    </div>
  );
}
