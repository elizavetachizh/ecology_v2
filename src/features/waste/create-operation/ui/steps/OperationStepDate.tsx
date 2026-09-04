import { useFormContext } from "react-hook-form";
import { FormField, Input } from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";

type OperationStepDateProps = {
  pending: boolean;
};

export function OperationStepDate({ pending }: OperationStepDateProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<OperationFormValues>();

  return (
    <FormField
      error={errors.date?.message}
      htmlFor="operation-date"
      required
      label={"Дата создания операции"}
    >
      <Input
        id="operation-date"
        type="date"
        disabled={pending}
        aria-invalid={Boolean(errors.date)}
        {...register("date")}
      />
    </FormField>
  );
}
