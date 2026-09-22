import { useFormContext, useWatch } from "react-hook-form";
import type { OperationFormValues } from "../../model/operation-form.schema";
import { resetAfterUnitChange } from "../../model/operation-wizard";
import { OperationStepBinding } from "./OperationStepBinding";
import { OperationStepDate } from "./OperationStepDate";
import { OperationStepUnit } from "./OperationStepUnit";

type OperationStepContextProps = {
  pending: boolean;
};

export function OperationStepContext({ pending }: OperationStepContextProps) {
  const { setValue } = useFormContext<OperationFormValues>();
  const unitId = useWatch<OperationFormValues, "unit_id">({ name: "unit_id" });

  return (
    <>
      <OperationStepDate pending={pending} />
      <OperationStepUnit
        pending={pending}
        onUnitChange={() => resetAfterUnitChange(setValue)}
      />
      {unitId ? (
        <OperationStepBinding pending={pending} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Выберите место учёта, чтобы указать инструкцию и отход.
        </p>
      )}
    </>
  );
}
