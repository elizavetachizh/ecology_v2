import { useFormContext, useWatch } from "react-hook-form";
import { useTenant } from "../../../../../entities/tenant";
import {
  OPERATION_TYPE_LABEL,
  OperationTypeValues,
} from "../../../../../entities/waste/operations";
import { useUnitInstructionWastesListQuery } from "../../../../../entities/waste/unit-instruction-waste";
import {
  flattenUnitTreePaths,
  formatUnitPathLabel,
  useUnitsTreeQuery,
} from "../../../../../entities/waste/units";
import {
  HAZARD_CLASS_LABEL,
  UOM_LABEL,
  wasteLabel,
} from "../../../../../entities/waste/wastes";
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
import { OperationSelectionSummary } from "../OperationSelectionSummary";
import { OperationTypeFields } from "../type-fields/OperationTypeFields";

type OperationStepDetailsProps = {
  pending: boolean;
  instructionId: string | undefined;
};

export function OperationStepDetails({
  pending,
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

  const units = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: { sort: "name", order: "asc" },
  });

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
  const selectedWaste = selectedBinding?.waste ?? null;

  const selectedFromTree = flattenUnitTreePaths(units.tree, {
    pod9Only: true,
  }).find((item) => item.unit.id === unitId);
  const brief = selectedBinding?.unit;
  const selectedUnitLabel = selectedFromTree
    ? formatUnitPathLabel(selectedFromTree.path)
    : brief
      ? brief.short_name
        ? `${brief.name} (${brief.short_name})`
        : brief.name
      : undefined;

  return (
    <>
      <OperationSelectionSummary
        unitLabel={selectedUnitLabel}
        wasteLabel={selectedWaste ? wasteLabel(selectedWaste) : undefined}
        wasteMeta={
          selectedWaste
            ? `${HAZARD_CLASS_LABEL[selectedWaste.hazard_class]} · ${UOM_LABEL[selectedWaste.uom]}`
            : undefined
        }
      />
      <CurrentBalanceHint
        tenantId={activeTenantId}
        unitId={unitId}
        wasteId={wasteId}
        uomLabel={selectedWaste ? UOM_LABEL[selectedWaste.uom] : undefined}
        transportUnit={selectedBinding?.transport_unit}
      />

      <Field>
        <FieldLabel htmlFor="operation-type" required>
          Тип операции
        </FieldLabel>
        <Select
          id="operation-type"
          className="w-full"
          disabled={pending}
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
        <FieldError>{errors.operation_type?.message}</FieldError>
      </Field>

      <OperationTypeFields
        pending={pending}
        tenantId={activeTenantId}
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
          autoComplete="off"
          placeholder="0,2"
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
