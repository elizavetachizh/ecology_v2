import { Controller, useFormContext } from "react-hook-form";
import { useTenant } from "../../../../../entities/tenant";
import { useUnitsTreeQuery } from "../../../../../entities/waste/units";
import type { OperationFormValues } from "../../model/operation-form.schema";
import { OperationUnitPicker } from "../OperationUnitPicker";

type OperationStepUnitProps = {
  pending: boolean;
  onUnitChange: () => void;
};

export function OperationStepUnit({
  pending,
  onUnitChange,
}: OperationStepUnitProps) {
  const { activeTenantId } = useTenant();
  const {
    control,
    formState: { errors },
  } = useFormContext<OperationFormValues>();

  const units = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: { sort: "name", order: "asc" },
  });

  return (
    <Controller
      name="unit_id"
      control={control}
      render={({ field }) => (
        <OperationUnitPicker
          tenantId={activeTenantId}
          tree={units.tree}
          loading={units.loading}
          error={units.error}
          value={field.value}
          onChange={(next) => {
            if (next !== field.value) onUnitChange();
            field.onChange(next);
          }}
          disabled={pending}
          errorMessage={errors.unit_id?.message}
        />
      )}
    />
  );
}
