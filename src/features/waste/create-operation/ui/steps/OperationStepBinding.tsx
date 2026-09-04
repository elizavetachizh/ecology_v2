import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTenant } from "../../../../../entities/tenant";
import {
  useUnitInstructionWastesListQuery,
  useUnitInstructionsListQuery,
} from "../../../../../entities/waste/unit-instruction-waste";
import type { OperationFormValues } from "../../model/operation-form.schema";
import {
  UIW_LIST_PARAMS,
  UNIT_INSTRUCTION_PARAMS,
  resetWasteDependentFields,
} from "../../model/operation-wizard";
import { resolveInstructionId } from "../../model/pick-preferred-instruction";
import { OperationInstructionPicker } from "../OperationInstructionPicker";
import { OperationWastePicker } from "../OperationWastePicker";

type OperationStepBindingProps = {
  pending: boolean;
};

export function OperationStepBinding({ pending }: OperationStepBindingProps) {
  const { activeTenantId } = useTenant();
  const { setValue, formState } = useFormContext<OperationFormValues>();
  const unitId = useWatch<OperationFormValues, "unit_id">({ name: "unit_id" });
  const wasteId = useWatch<OperationFormValues, "waste_id">({
    name: "waste_id",
  });
  const selectedInstructionId = useWatch<OperationFormValues, "instruction_id">(
    {
      name: "instruction_id",
    },
  );

  const instructionsQuery = useUnitInstructionsListQuery({
    tenantId: activeTenantId,
    unitId,
    params: UNIT_INSTRUCTION_PARAMS,
    enabled: Boolean(unitId),
  });

  const instructionId = resolveInstructionId(
    selectedInstructionId,
    instructionsQuery.items,
    instructionsQuery.loading,
  );

  useEffect(() => {
    if (selectedInstructionId || !instructionId) return;
    setValue("instruction_id", instructionId);
  }, [instructionId, selectedInstructionId, setValue]);

  const wastesQuery = useUnitInstructionWastesListQuery({
    tenantId: activeTenantId,
    scope: {
      unitId,
      instructionId: instructionId ?? "",
    },
    params: UIW_LIST_PARAMS,
    enabled: Boolean(unitId && instructionId),
  });

  const selectedBinding = wastesQuery.items.find(
    (item) => item.waste_id === wasteId,
  );

  return (
    <>
      <OperationInstructionPicker
        key={unitId}
        unitId={unitId}
        instructions={instructionsQuery.items}
        loading={instructionsQuery.loading}
        error={instructionsQuery.error}
        value={instructionId}
        onChange={(nextId) => {
          if (nextId === instructionId) return;
          setValue("instruction_id", nextId);
          setValue("waste_id", "");
          resetWasteDependentFields(setValue);
        }}
        disabled={pending}
      />
      {instructionId ? (
        <OperationWastePicker
          key={instructionId}
          unitId={unitId}
          instructionId={instructionId}
          tenantId={activeTenantId}
          items={wastesQuery.items}
          total={wastesQuery.total}
          loading={wastesQuery.loading}
          error={wastesQuery.error}
          value={wasteId}
          selectedWaste={selectedBinding?.waste ?? null}
          onChange={(nextWasteId) => {
            setValue("waste_id", nextWasteId, { shouldValidate: true });
            resetWasteDependentFields(setValue);
          }}
          disabled={pending}
          errorMessage={formState.errors.waste_id?.message}
        />
      ) : null}
    </>
  );
}
