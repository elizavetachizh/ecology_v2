import { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTenant } from "../../../../../entities/tenant";
import type { Operation } from "../../../../../entities/waste/operations";
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
import { useInstructionIdForWaste } from "../../model/use-instruction-id-for-waste";
import { OperationInstructionPicker } from "../OperationInstructionPicker";
import { OperationWastePicker } from "../OperationWastePicker";

type OperationStepBindingProps = {
  mode: "create" | "edit";
  pending: boolean;
  initial?: Operation | null;
  selectedInstructionId: string | undefined;
  onInstructionIdChange: (instructionId: string | undefined) => void;
};

export function OperationStepBinding({
  mode,
  pending,
  initial,
  selectedInstructionId,
  onInstructionIdChange,
}: OperationStepBindingProps) {
  const { activeTenantId } = useTenant();
  const { setValue, formState } = useFormContext<OperationFormValues>();
  const unitId = useWatch<OperationFormValues, "unit_id">({ name: "unit_id" });
  const wasteId = useWatch<OperationFormValues, "waste_id">({
    name: "waste_id",
  });

  const instructionsQuery = useUnitInstructionsListQuery({
    tenantId: activeTenantId,
    unitId,
    params: UNIT_INSTRUCTION_PARAMS,
    enabled: Boolean(unitId),
  });

  const seedInstruction = useInstructionIdForWaste({
    tenantId: activeTenantId,
    unitId,
    wasteId,
    instructions: instructionsQuery.items,
    enabled:
      mode === "edit" &&
      !selectedInstructionId &&
      unitId === (initial?.unit_id ?? "") &&
      wasteId === (initial?.waste_id ?? "") &&
      !instructionsQuery.loading,
  });

  useEffect(() => {
    if (selectedInstructionId || !seedInstruction.instructionId) return;
    onInstructionIdChange(seedInstruction.instructionId);
  }, [
    seedInstruction.instructionId,
    selectedInstructionId,
    onInstructionIdChange,
  ]);

  const instructionId = resolveInstructionId(
    selectedInstructionId,
    instructionsQuery.items,
    instructionsQuery.loading || seedInstruction.loading,
  );

  useEffect(() => {
    if (mode === "edit") return;
    if (selectedInstructionId || !instructionId) return;
    onInstructionIdChange(instructionId);
  }, [mode, instructionId, selectedInstructionId, onInstructionIdChange]);

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
  const selectedWaste =
    selectedBinding?.waste ??
    (initial?.waste_id === wasteId ? initial.waste : null);

  return (
    <>
      <OperationInstructionPicker
        key={unitId}
        unitId={unitId}
        instructions={instructionsQuery.items}
        loading={instructionsQuery.loading || seedInstruction.loading}
        error={instructionsQuery.error}
        value={instructionId}
        onChange={(nextId) => {
          if (nextId === instructionId) return;
          onInstructionIdChange(nextId);
          setValue("waste_id", "");
          resetWasteDependentFields(setValue);
        }}
        disabled={pending}
      />
      {instructionId ? (
        <OperationWastePicker
          key={instructionId}
          unitId={unitId}
          items={wastesQuery.items}
          total={wastesQuery.total}
          loading={wastesQuery.loading}
          error={wastesQuery.error}
          value={wasteId}
          selectedWaste={selectedWaste}
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
