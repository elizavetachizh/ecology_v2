import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import {
  Button,
  ConfirmDialog,
  DataTable,
  type ExpandedState,
} from "../../../shared/ui";
import { withActionRows, type StructureNode } from "./model/structure.mock";
import {
  deleteStructureNode,
  getStructureTree,
  subscribeStructure,
} from "./model/structure.store";
import { removeBindingsForStructureNodes } from "../../../entities/waste/directory";
import { createStructureColumns } from "./ui/structure-columns";

function mergeExpanded(
  prev: ExpandedState,
  ids: Array<string | null | undefined>,
): ExpandedState {
  if (prev === true) return prev;
  const next: Record<string, boolean> = {
    ...(prev as Record<string, boolean>),
  };
  for (const id of ids) {
    if (id) next[id] = true;
  }
  return next;
}

export function DirectoriesStructurePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/directories/structure" });

  const structure = useSyncExternalStore(
    subscribeStructure,
    getStructureTree,
    getStructureTree,
  );

  const [expanded, setExpanded] = useState<ExpandedState>(() =>
    mergeExpanded(
      {
        "unit-1": true,
        "unit-1-1": true,
      },
      [search.expandId, search.focusId],
    ),
  );
  const [deletingNode, setDeletingNode] = useState<StructureNode | null>(null);
  const focusId = search.focusId ?? null;

  const data = useMemo(() => withActionRows(structure), [structure]);

  const openCreateUnit = useCallback(
    (parentId?: string) => {
      void navigate({
        to: "/directories/structure/units/new",
        search: parentId ? { parentId } : { parentId: "" },
      });
    },
    [navigate],
  );

  const columns = useMemo(
    () =>
      createStructureColumns({
        onAddUnit: (parentId) => openCreateUnit(parentId),
        onDeleteNode: setDeletingNode,
      }),
    [openCreateUnit],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Структура организации
          </h1>
          <p className="text-sm text-muted-foreground">
            Вложенные структурные единицы. Создайте структурные подразделения,
            цеха, площадки, которые ведут учет отходов. Журналы ПОД-9
            отображаются в дереве и создаются на карточке единицы.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => openCreateUnit()}>
            <Plus className="size-3.5" />
            Добавить структурную единицу
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/directories">К справочникам</Link>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        getRowId={(row: StructureNode) => row.id}
        getSubRows={(row: StructureNode) => row.children}
        expanded={expanded}
        onExpandedChange={setExpanded}
        emptyTitle="Структура пуста"
        emptyDescription="Добавьте структурную единицу."
        getRowClassName={(row) => {
          if (row.original.type === "actions") {
            return "bg-muted/30 hover:bg-muted/40";
          }
          if (focusId && row.original.id === focusId) {
            return "bg-info-muted/60 ring-1 ring-inset ring-info/30";
          }
          return undefined;
        }}
      />

      <ConfirmDialog
        open={deletingNode !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingNode(null);
        }}
        title={
          deletingNode?.type === "unit"
            ? "Удалить структурную единицу?"
            : "Удалить журнал ПОД-9?"
        }
        description={
          deletingNode?.type === "unit" ? (
            <>
              Единица «{deletingNode.name}», все дочерние единицы, журналы
              ПОД-9 и связанные привязки отходов будут удалены.
            </>
          ) : (
            <>
              Журнал «{deletingNode?.name}» и его привязки к отходам будут
              удалены. Карточки отходов сохранятся в справочнике.
            </>
          )
        }
        onConfirm={() => {
          if (!deletingNode) return;
          const removedIds = deleteStructureNode(deletingNode.id);
          removeBindingsForStructureNodes(removedIds);
        }}
      />
    </div>
  );
}
