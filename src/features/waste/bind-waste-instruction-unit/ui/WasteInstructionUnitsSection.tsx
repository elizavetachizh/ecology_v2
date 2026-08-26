import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  InstructionBindingsTabs,
  useInstructionBindingsTabs,
} from "../../../../entities/waste/instructions";
import {
  DEFAULT_WIU_LIST_LIMIT,
  deleteWasteInstructionUnit,
  useWasteInstructionUnitsListQuery,
  type WasteInstructionUnit,
} from "../../../../entities/waste/waste-instruction-units";
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
import { BindWiuModal } from "./BindWiuModal";
import { wiuColumns } from "./wiu-columns";

type WasteInstructionUnitsSectionProps = {
  tenantId: string | null;
  wasteId: string;
  instructionId?: string;
  onInstructionChange: (instructionId: string | undefined) => void;
};

export function WasteInstructionUnitsSection({
  tenantId,
  wasteId,
  instructionId,
  onInstructionChange,
}: WasteInstructionUnitsSectionProps) {
  const [offset, setOffset] = useState(0);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<WasteInstructionUnit | null>(null);
  const [detaching, setDetaching] = useState<WasteInstructionUnit | null>(null);

  const handleInstructionChange = (nextId: string | undefined) => {
    setOffset(0);
    onInstructionChange(nextId);
  };

  const { activeInstructionId, instructions, loading, error } =
    useInstructionBindingsTabs({
      tenantId,
      instructionId,
      onInstructionChange: handleInstructionChange,
    });

  const scope = {
    wasteId,
    instructionId: activeInstructionId ?? "",
  };

  const listParams = useMemo(
    () => ({
      limit: DEFAULT_WIU_LIST_LIMIT,
      offset,
    }),
    [offset],
  );

  const bindingsQuery = useWasteInstructionUnitsListQuery({
    tenantId,
    scope,
    params: listParams,
    enabled: Boolean(activeInstructionId),
  });

  const deleteMutation = useMutation({
    mutationFn: (bindingId: string) =>
      deleteWasteInstructionUnit(scope, bindingId),
    onSuccess: () => {
      invalidateBindingQueries();
      setDetaching(null);
    },
  });

  const columns = wiuColumns(setEditing, setModalMode, setDetaching);

  const instructionsSlot = (
    <InstructionBindingsTabs
      loading={loading}
      error={error}
      instructions={instructions}
      value={activeInstructionId ?? ""}
      onValueChange={handleInstructionChange}
      emptyDescription={
        <>
          Сначала создайте инструкцию в справочнике, затем вернитесь к привязке
          журналов ПОД-9.{" "}
          <Link
            to="/directories/instructions/new"
            className="font-medium underline-offset-4 hover:underline"
          >
            Создать инструкцию
          </Link>
        </>
      }
    />
  );

  const content = activeInstructionId ? (
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
          emptyDescription="Привяжите журнал ПОД-9 из структуры организации."
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
  ) : null;

  return (
    <InstructionScopedBindingsSection
      title="Журналы ПОД-9"
      description="Выберите инструкцию на вкладке — ниже список журналов ПОД-9, в которых
    ведется учет отхода."
      bindLabel="Привязать журнал ПОД-9"
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
              привязки журналов ПОД-9.
            </AlertDescription>
          </Alert>
        ) : null
      }
      content={content}
      modal={
        activeInstructionId ? (
          <BindWiuModal
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
              toast.success(
                modalMode === "create"
                  ? "Привязка журналов ПОД-9 успешно создана"
                  : "Привязка журналов ПОД-9 успешно обновлена",
              );
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
          title="Отвязать журнал ПОД-9?"
          confirmLabel="Отвязать"
          description={
            <>
              Привязка «{detaching?.unit.name ?? "—"}» будет удалена для этого
              отхода по текущей инструкции.
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
