import { useFormContext } from "react-hook-form";
import { FormField, Select } from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";

type EnumFieldName = Extract<
  keyof OperationFormValues,
  "use_purpose" | "neutralization_method" | "transfer_receipt_purpose"
>;

type EnumSelectFieldProps<T extends string> = {
  name: EnumFieldName;
  label: string;
  values: readonly T[];
  labels: Record<T, string>;
  placeholder: string;
  pending: boolean;
};

export function EnumSelectField<T extends string>({
  name,
  label,
  values,
  labels,
  placeholder,
  pending,
}: EnumSelectFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<OperationFormValues>();

  return (
    <FormField
      htmlFor={name}
      label={label}
      required
      error={errors[name]?.message}
    >
      <Select
        id={name}
        className="w-full"
        disabled={pending}
        aria-invalid={Boolean(errors[name])}
        {...register(name)}
      >
        <option value="">{placeholder}</option>
        {values.map((value) => (
          <option key={value} value={value}>
            {labels[value]}
          </option>
        ))}
      </Select>
    </FormField>
  );
}
