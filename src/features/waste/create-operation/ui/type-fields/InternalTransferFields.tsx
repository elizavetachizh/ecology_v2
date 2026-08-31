import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTenant } from "../../../../../entities/tenant";
import { useUnitsTreeQuery } from "../../../../../entities/waste/units";
import { Alert, AlertDescription } from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";
import { OperationUnitPicker } from "../OperationUnitPicker";
import { TransferReceiptPurposeField } from "./TransferReceiptPurposeField";

type InternalTransferFieldsProps = {
  pending: boolean;
};

export function InternalTransferFields({
  pending,
}: InternalTransferFieldsProps) {
  const { activeTenantId } = useTenant();
  const {
    control,
    formState: { errors },
  } = useFormContext<OperationFormValues>();
  const operationType = useWatch<OperationFormValues, "operation_type">({
    name: "operation_type",
  });
  const unitId = useWatch<OperationFormValues, "unit_id">({ name: "unit_id" });

  const units = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: { sort: "name", order: "asc" },
  });

  const sideLabel =
    operationType === "received_in" ? "Откуда поступило" : "Куда передано";

  return (
    <>
      <Controller
        name="unit_side_id"
        control={control}
        render={({ field }) => (
          <OperationUnitPicker
            tenantId={activeTenantId}
            tree={units.tree}
            loading={units.loading}
            error={units.error}
            value={field.value}
            excludeUnitId={unitId}
            onChange={field.onChange}
            disabled={pending}
            errorMessage={errors.unit_side_id?.message}
            htmlFor="unit_side_id"
            label={sideLabel}
            placeholder="Выберите структурное подразделение…"
            aria-label={sideLabel}
            description="Другой журнал ПОД-9. Нельзя выбрать то же место учёта."
          />
        )}
      />
      <TransferReceiptPurposeField pending={pending} />
      {operationType === "transferred_in" ? (
        <Alert variant="info">
          <AlertDescription>
            Будет создана парная операция поступления. Остатки изменятся после
            подтверждения принимающей стороной.
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}
