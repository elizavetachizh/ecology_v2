import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  DEFAULT_INSTRUCTIONS_LIST_LIMIT,
  InstructionTabs,
  useActiveInstructionId,
  useInstructionsListQuery,
} from "../../../../entities/waste/instructions";

import {
  DEFAULT_UIW_LIST_LIMIT,
  deleteUnitInstructionWaste,
  useUnitInstructionWastesListQuery,
  type UnitInstructionWaste,
} from "../../../../entities/waste/unit-instruction-waste";
import { invalidateBindingQueries } from "../../../../shared/lib/invalidate-binding-queries";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  ConfirmDialog,
  DataTable,
  DataTablePagination,
  InstructionScopedBindingsSection,
  toast,
} from "../../../../shared/ui";
import { BindUiwModal } from "./BindUiwModal";
import { uiwColumns } from "./uiw-columns";

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
      sort: "name",
      order: "asc",
      limit: DEFAULT_INSTRUCTIONS_LIST_LIMIT,
      offset: 0,
    },
  });

  const instructions = instructionsQuery.items;
  const activeInstructionId = useActiveInstructionId({
    instructionId,
    instructions,
    onInstructionChange,
  });

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
      invalidateBindingQueries();
      setDetaching(null);
    },
  });

  const columns = uiwColumns(setEditing, setModalMode, setDetaching);

  const instructionsSlot = instructionsQuery.loading ? (
    <p className="text-sm text-muted-foreground">Загрузка инструкций…</p>
  ) : instructions.length === 0 ? (
    <Alert variant="info">
      <AlertTitle>Нет инструкций</AlertTitle>
      <AlertDescription>
        Сначала создайте инструкцию в справочнике, затем вернитесь к привязке
        отходов.{" "}
        <Link
          to="/directories/instructions/new"
          className="font-medium underline-offset-4 hover:underline"
        >
          Создать инструкцию
        </Link>
      </AlertDescription>
    </Alert>
  ) : (
    <InstructionTabs
      instructions={instructions}
      value={activeInstructionId ?? ""}
      onValueChange={(nextId) => {
        setOffset(0);
        onInstructionChange(nextId || undefined);
      }}
    />
  );

  const content = !activeInstructionId ? null : bindingsQuery.error ? (
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
  );

  return (
    <InstructionScopedBindingsSection
      title="Привязка отходов по инструкции"
      description="Выберите инструкцию на вкладке — ниже список привязанных отходов для этого ПОД-9."
      bindLabel="Привязать отход"
      bindDisabled={!activeInstructionId}
      onBind={() => {
        setEditing(null);
        setModalMode("create");
      }}
      instructionsSlot={instructionsSlot}
      selectHint={
        !activeInstructionId && instructions.length > 0 ? (
          <Alert variant="info">
            <AlertTitle>Выберите инструкцию</AlertTitle>
            <AlertDescription>
              Откройте вкладку инструкции, чтобы увидеть и редактировать
              привязки отходов.
            </AlertDescription>
          </Alert>
        ) : null
      }
      content={content}
      modal={
        activeInstructionId ? (
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
              toast.success("Привязка отходов успешно создана");
              setModalMode(null);
              setEditing(null);
            }}
          />
        ) : null
      }
      confirm={
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
      }
    />
  );
}
