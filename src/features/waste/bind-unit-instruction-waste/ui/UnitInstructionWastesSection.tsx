import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  InstructionBindingsTabs,
  useInstructionBindingsTabs,
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
import { uiwDeleteErrorMessage } from "../model/uiw-write-error";
import { uiwColumns } from "./uiw-columns";
import { routes } from "../../../../shared/config/routes";

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
      toast.success("Отход успешно отвязан");
    },
    onError: (err) => toast.error(uiwDeleteErrorMessage(err)),
  });

  const columns = uiwColumns(setEditing, setModalMode, setDetaching);

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
          отходов.{" "}
          <Link
            to={routes.directories.instructions.new}
            className="font-medium underline-offset-4 hover:underline"
          >
            Создать инструкцию
          </Link>
        </>
      }
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
              toast.success(
                modalMode === "create"
                  ? "Привязка отхода успешно создана"
                  : "Привязка отхода успешно обновлена",
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
          confirmDisabled={deleteMutation.isPending}
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
            if (detaching) deleteMutation.mutate(detaching.id);
          }}
        />
      }
    />
  );
}
