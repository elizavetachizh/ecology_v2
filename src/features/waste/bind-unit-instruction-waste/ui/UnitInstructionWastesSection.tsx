import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pencil, Plus, Unlink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  DEFAULT_INSTRUCTIONS_LIST_LIMIT,
  useInstructionsListQuery,
  type Instruction,
} from "../../../../entities/waste/instructions";
import {
  HAZARD_CLASS_LABEL,
  UOM_LABEL,
} from "../../../../entities/waste/wastes";
import {
  DEFAULT_UIW_LIST_LIMIT,
  deleteUnitInstructionWaste,
  uiwQueryKeys,
  useUnitInstructionWastesListQuery,
  type UnitInstructionWaste,
} from "../../../../entities/waste/unit-instruction-waste";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  DataTableRowAction,
  DataTableRowActions,
  Tabs,
  TabsList,
  TabsTrigger,
  type ColumnDef,
} from "../../../../shared/ui";
import { BindUiwModal } from "./BindUiwModal";

type UnitInstructionWastesSectionProps = {
  tenantId: string | null;
  unitId: string;
  instructionId?: string;
  onInstructionChange: (instructionId: string | undefined) => void;
};

export function UnitInstructionWastesSection({
  tenantId,
  unitId,
  instructionId,
  onInstructionChange,
}: UnitInstructionWastesSectionProps) {
  const [offset, setOffset] = useState(0);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<UnitInstructionWaste | null>(null);
  const [detaching, setDetaching] = useState<UnitInstructionWaste | null>(null);

  const instructionsQuery = useInstructionsListQuery({
    tenantId,
    params: {
      status: "active",
      sort: "name",
      order: "asc",
      limit: DEFAULT_INSTRUCTIONS_LIST_LIMIT,
      offset: 0,
    },
  });

  const instructions = instructionsQuery.items;
  const activeInstructionId =
    instructionId && instructions.some((item) => item.id === instructionId)
      ? instructionId
      : undefined;

  useEffect(() => {
    if (activeInstructionId || instructions.length === 0) return;
    onInstructionChange(instructions[0]!.id);
  }, [activeInstructionId, instructions, onInstructionChange]);

  const scope = {
    unitId,
    instructionId: activeInstructionId ?? "",
  };

  const listParams = useMemo(
    () => ({
      limit: DEFAULT_UIW_LIST_LIMIT,
      offset,
    }),
    [offset],
  );

  const bindingsQuery = useUnitInstructionWastesListQuery({
    tenantId,
    scope,
    params: listParams,
    enabled: Boolean(activeInstructionId),
  });

  const deleteMutation = useMutation({
    mutationFn: (bindingId: string) =>
      deleteUnitInstructionWaste(scope, bindingId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: uiwQueryKeys.lists() });
      setDetaching(null);
    },
  });

  const columns = useMemo<ColumnDef<UnitInstructionWaste>[]>(
    () => [
      {
        id: "code",
        header: "Код",
        cell: ({ row }) => row.original.waste.waste_classifier.code,
      },
      {
        id: "name",
        header: "Наименование",
        cell: ({ row }) => (
          <Link
            to="/directories/wastes/$wasteId"
            params={{ wasteId: row.original.waste_id }}
            className="font-medium hover:underline"
          >
            {row.original.waste.waste_classifier.name}
          </Link>
        ),
      },
      {
        id: "hazard",
        header: "Класс опасности",
        cell: ({ row }) => HAZARD_CLASS_LABEL[row.original.waste.hazard_class],
      },
      {
        id: "uom",
        header: "Ед. изм.",
        cell: ({ row }) => UOM_LABEL[row.original.waste.uom],
      },
      {
        id: "sources",
        header: "Источники",
        cell: ({ row }) => {
          const sources = row.original.waste_sources;
          if (sources.length === 0) {
            return (
              <span className="text-xs text-muted-foreground">Не указаны</span>
            );
          }
          return (
            <div className="flex max-w-xs flex-wrap gap-1">
              {sources.map((source) => (
                <Badge key={source.id} variant="secondary">
                  {source.name}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: "transport_unit",
        header: "Тр. ед.",
        cell: ({ row }) => row.original.transport_unit,
      },
      {
        id: "actions",
        header: () => <div className="text-right">Действия</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <DataTableRowActions>
            <DataTableRowAction
              label="Изменить привязку"
              onClick={() => {
                setEditing(row.original);
                setModalMode("edit");
              }}
            >
              <Pencil />
              Изменить
            </DataTableRowAction>
            <DataTableRowAction
              label="Отвязать отход"
              onClick={() => setDetaching(row.original)}
            >
              <Unlink className="text-destructive" />
              Отвязать
            </DataTableRowAction>
          </DataTableRowActions>
        ),
      },
    ],
    [],
  );

  const instructionLabel = (item: Instruction) =>
    item.short_name ? `${item.name} (${item.short_name})` : item.name;

  return (
    <section className="mx-auto max-w-4xl space-y-6 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Привязка отходов по инструкции
          </h2>
          <p className="text-sm text-muted-foreground">
            Выберите инструкцию на вкладке — ниже список привязанных отходов для
            этого ПОД-9.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!activeInstructionId}
          onClick={() => {
            setEditing(null);
            setModalMode("create");
          }}
        >
          <Plus className="size-3.5" />
          Привязать отход
        </Button>
      </div>

      {instructionsQuery.loading ? (
        <p className="text-sm text-muted-foreground">Загрузка инструкций…</p>
      ) : instructions.length === 0 ? (
        <Alert variant="info">
          <AlertTitle>Нет активных инструкций</AlertTitle>
          <AlertDescription>
            Сначала создайте активную инструкцию в справочнике, затем вернитесь
            к привязке отходов.{" "}
            <Link
              to="/directories/instructions/new"
              className="font-medium underline-offset-4 hover:underline"
            >
              Создать инструкцию
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs
          value={activeInstructionId ?? ""}
          onValueChange={(nextId) => {
            setOffset(0);
            onInstructionChange(nextId || undefined);
          }}
        >
          <TabsList
            aria-label="Инструкции"
            className="max-w-full justify-start overflow-x-auto"
          >
            {instructions.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="max-w-72 shrink-0"
              >
                <span className="truncate">{instructionLabel(item)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {!activeInstructionId && instructions.length > 0 ? (
        <Alert variant="info">
          <AlertTitle>Выберите инструкцию</AlertTitle>
          <AlertDescription>
            Откройте вкладку инструкции, чтобы увидеть и редактировать привязки
            отходов.
          </AlertDescription>
        </Alert>
      ) : null}

      {activeInstructionId ? (
        bindingsQuery.error ? (
          <Alert variant="error">
            <AlertTitle>Не удалось загрузить привязки</AlertTitle>
            <AlertDescription>{bindingsQuery.error.message}</AlertDescription>
          </Alert>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={bindingsQuery.items}
              getRowId={(row) => row.id}
              isLoading={bindingsQuery.loading}
              emptyTitle="Привязок пока нет"
              emptyDescription="Привяжите существующий отход из справочника организации."
            />
            <DataTablePagination
              total={bindingsQuery.total}
              limit={bindingsQuery.limit}
              offset={bindingsQuery.offset}
              disabled={bindingsQuery.loading}
              onOffsetChange={setOffset}
            />
          </>
        )
      ) : null}

      {activeInstructionId ? (
        <BindUiwModal
          open={modalMode !== null}
          mode={modalMode === "edit" ? "edit" : "create"}
          tenantId={tenantId}
          scope={scope}
          initial={editing}
          onOpenChange={(open) => {
            if (!open) {
              setModalMode(null);
              setEditing(null);
            }
          }}
          onSaved={() => {
            setModalMode(null);
            setEditing(null);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={detaching !== null}
        onOpenChange={(open) => {
          if (!open) setDetaching(null);
        }}
        title="Отвязать отход?"
        confirmLabel="Отвязать"
        description={
          <>
            Привязка «{detaching?.waste.waste_classifier.name ?? "—"}» будет
            удалена для этой инструкции. Карточка отхода в справочнике
            останется.
          </>
        }
        onConfirm={() => {
          if (detaching) void deleteMutation.mutateAsync(detaching.id);
        }}
      />
    </section>
  );
}
