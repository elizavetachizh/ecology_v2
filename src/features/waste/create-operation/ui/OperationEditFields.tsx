import { useFormContext } from "react-hook-form";
import { useTenant } from "../../../../entities/tenant";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import { FormField, Input } from "../../../../shared/ui";
import type { EditOperationFormValues } from "../model/edit-operation-form.schema";
import type { Operation } from "../../../../entities/waste/operations";
import { CurrentBalanceHint } from "./CurrentBalanceHint";
import { FormedFields } from "./type-fields/FormedFields";

type OperationEditFieldsProps = {
  operation: Operation;
  pending: boolean;
};

export function OperationEditFields({
  operation,
  pending,
}: OperationEditFieldsProps) {
  const { activeTenantId } = useTenant();
  const {
    register,
    formState: { errors },
  } = useFormContext<EditOperationFormValues>();
  const uom = UOM_LABEL[operation.waste.uom];

  return (
    <>
      <div className="sm:col-span-2">
        <CurrentBalanceHint
          tenantId={activeTenantId}
          unitId={operation.unit_id}
          wasteId={operation.waste_id}
          uomLabel={uom}
        />
      </div>
      <FormField
        htmlFor="operation-date"
        required
        label="Дата операции"
        error={errors.date?.message}
      >
        <Input
          id="operation-date"
          type="date"
          disabled={pending}
          aria-invalid={Boolean(errors.date)}
          {...register("date")}
        />
      </FormField>

      <FormField
        htmlFor="amount"
        required
        label={`Количество (${uom})`}
        error={errors.amount?.message}
        description={"Число больше 0, до 6 знаков после запятой."}
      >
        <Input
          id="amount"
          inputMode="decimal"
          type="number"
          placeholder="0"
          disabled={pending}
          aria-invalid={Boolean(errors.amount)}
          {...register("amount")}
        />
      </FormField>

      {operation.operation_type === "formed" ? (
        <div className="sm:col-span-2">
          <FormedFields
            pending={pending}
            bindingSources={[]}
            tenantId={activeTenantId}
            currentSource={operation.waste_source}
          />
        </div>
      ) : null}
    </>
  );
}
