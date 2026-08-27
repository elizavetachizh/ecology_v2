import { useFormContext } from "react-hook-form";
import { Field, FieldError, FieldLabel, Input } from "../../../../../shared/ui";
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
    <Field>
      <FieldLabel htmlFor="operation-date" required>
        Дата создания операции
      </FieldLabel>
      <Input
        id="operation-date"
        type="date"
        disabled={pending}
        aria-invalid={Boolean(errors.date)}
        {...register("date")}
      />
      <FieldError>{errors.date?.message}</FieldError>
    </Field>
  );
}
