import { useFormContext, useWatch } from "react-hook-form";
import { useTenant } from "../../../../../entities/tenant";
import {
  OPERATION_TYPE_LABEL,
  OperationTypeValues,
  type Operation,
} from "../../../../../entities/waste/operations";
import { useUnitInstructionWastesListQuery } from "../../../../../entities/waste/unit-instruction-waste";
import { UOM_LABEL } from "../../../../../entities/waste/wastes";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Select,
} from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";
import {
  UIW_LIST_PARAMS,
  resetTypeSpecificFields,
} from "../../model/operation-wizard";
import { CurrentBalanceHint } from "../CurrentBalanceHint";
import { OperationTypeFields } from "../type-fields/OperationTypeFields";

type OperationStepDetailsProps = {
  pending: boolean;
  initial?: Operation | null;
  instructionId: string | undefined;
};

export function OperationStepDetails({
  pending,
  initial,
  instructionId,
}: OperationStepDetailsProps) {
  const { activeTenantId } = useTenant();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<OperationFormValues>();
  const unitId = useWatch<OperationFormValues, "unit_id">({ name: "unit_id" });
  const wasteId = useWatch<OperationFormValues, "waste_id">({
    name: "waste_id",
  });
  const typeLocked = Boolean(initial?.linked_operation_id);

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
      <CurrentBalanceHint
        tenantId={activeTenantId}
        unitId={unitId}
        wasteId={wasteId}
        uomLabel={selectedWaste ? UOM_LABEL[selectedWaste.uom] : undefined}
      />

      <Field>
        <FieldLabel htmlFor="operation-type" required>
          Тип операции
        </FieldLabel>
        <Select
          id="operation-type"
          className="w-full"
          disabled={pending || typeLocked}
          aria-invalid={Boolean(errors.operation_type)}
          {...register("operation_type", {
            onChange: () => {
              resetTypeSpecificFields(setValue);
            },
          })}
        >
          <option value="">Выберите тип</option>
          {OperationTypeValues.map((type) => (
            <option key={type} value={type}>
              {OPERATION_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        {typeLocked ? (
          <FieldDescription>
            Тип связанной пары передачи изменить нельзя.
          </FieldDescription>
        ) : null}
        <FieldError>{errors.operation_type?.message}</FieldError>
      </Field>

      <OperationTypeFields
        pending={pending} tenantId={activeTenantId}
        initial={initial}
        bindingSources={selectedBinding?.waste_sources ?? []}
      />

      <Field>
        <FieldLabel htmlFor="amount" required>
          Количество
          {selectedWaste ? ` (${UOM_LABEL[selectedWaste.uom]})` : ""}
        </FieldLabel>
        <Input
          id="amount"
          inputMode="decimal"
          placeholder="0"
          disabled={pending}
          aria-invalid={Boolean(errors.amount)}
          {...register("amount")}
        />
        <FieldDescription>
          Число больше 0, до 6 знаков после запятой.
        </FieldDescription>
        <FieldError>{errors.amount?.message}</FieldError>
      </Field>
    </>
  );
}
