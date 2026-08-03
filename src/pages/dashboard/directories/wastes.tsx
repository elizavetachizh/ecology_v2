import { useMemo, useState, useSyncExternalStore } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  getInstructions,
  subscribeInstructions,
} from "../../../entities/regulatory-document";
import {
  Button,
  ConfirmDialog,
  DataTable,
  DataTableRowAction,
  DataTableRowActions,
  Select,
  type ColumnDef,
} from "../../../shared/ui";
import {
  deleteWaste,
  formatBindingLabels,
  getPod9WastesSnapshot,
  getWasteBindings,
  getWastesByInstruction,
  subscribeWastes,
  type DirectoryWaste,
} from "./model/pod9-wastes.store";
import { getStructureTree, subscribeStructure } from "./model/structure.store";

export function WastesDirectoryPage() {
  const [deletingWaste, setDeletingWaste] = useState<DirectoryWaste | null>(
    null,
  );
  const navigate = useNavigate();
  const search = useSearch({ from: "/directories/wastes" });
  const instructions = useSyncExternalStore(
    subscribeInstructions,
    getInstructions,
    getInstructions,
  );
  useSyncExternalStore(subscribeStructure, getStructureTree, getStructureTree);
  const storeVersion = useSyncExternalStore(
    subscribeWastes,
    getPod9WastesSnapshot,
    getPod9WastesSnapshot,
  );
  const instructionId = search.instructionId ?? instructions[0]?.id ?? null;
  const wastes = useMemo(
    () => {
      void storeVersion;
      return getWastesByInstruction(instructionId);
    },
    [instructionId, storeVersion],
  );

  const columns = useMemo<ColumnDef<DirectoryWaste>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <Link
            to="/directories/wastes/$wasteId"
            params={{ wasteId: row.original.id }}
            search={{ instructionId: row.original.instructionId }}
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
          const bindings = getWasteBindings(
            row.original.id,
            row.original.instructionId,
          );
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
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction asChild label="Открыть и изменить отход">
              <Link
                to="/directories/wastes/$wasteId"
                params={{ wasteId: row.original.id }}
                search={{ instructionId: row.original.instructionId }}
              >
                <Pencil />
                Изменить
              </Link>
            </DataTableRowAction>
            <DataTableRowAction
              label="Удалить отход"
              onClick={() => setDeletingWaste(row.original)}
            >
              <Trash2 className="text-destructive" />
              Удалить
            </DataTableRowAction>
          </DataTableRowActions>
        ),
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
          <Select
            aria-label="Фильтр по инструкции"
            value={instructionId ?? ""}
            onChange={(event) =>
              void navigate({
                to: "/directories/wastes",
                search: { instructionId: event.target.value || undefined },
                replace: true,
              })
            }
            disabled={instructions.length === 0}
            className="mt-2 max-w-xl"
          >
            {instructions.length === 0 ? (
              <option value="">Инструкций пока нет</option>
            ) : (
              instructions.map((instruction) => (
                <option key={instruction.id} value={instruction.id}>
                  {instruction.number} — {instruction.title}
                </option>
              ))
            )}
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link
              to="/directories/wastes/new"
              search={{ instructionId: instructionId ?? undefined }}
            >
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
        emptyDescription="В выбранной инструкции отходов пока нет. Создайте отход — привязки к единицам и ПОД-9 добавите после."
      />

      <ConfirmDialog
        open={deletingWaste !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingWaste(null);
        }}
        title="Удалить вид отхода?"
        description={
          <>
            Вид отхода «{deletingWaste?.name}» и все его привязки к структурным
            единицам и ПОД-9 будут удалены. Это действие нельзя отменить.
          </>
        }
        onConfirm={() => {
          if (deletingWaste) deleteWaste(deletingWaste.id);
        }}
      />
    </div>
  );
}
