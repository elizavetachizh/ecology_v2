import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormField, Input } from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";

type OperationStepDateProps = {
  pending: boolean;
};

export function OperationStepDate({ pending }: OperationStepDateProps) {
  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useFormContext<OperationFormValues>();

  useEffect(() => {
    if (getValues("date")) {
      void trigger("date");
    }
  }, [getValues, trigger]);

  const dateField = register("date");

  return (
    <FormField
      error={errors.date?.message}
      htmlFor="operation-date"
      required
      label={"Дата проведения операции"}
    >
      <Input
        id="operation-date"
        type="date"
        disabled={pending}
        aria-invalid={Boolean(errors.date)}
        {...dateField}
        onChange={(event) => {
          void dateField.onChange(event);
          void trigger("date");
        }}
      />
    </FormField>
  );
}
