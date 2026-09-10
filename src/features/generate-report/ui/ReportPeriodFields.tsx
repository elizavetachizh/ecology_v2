import type { UseFormRegisterReturn } from "react-hook-form";
import { FormField, Input } from "../../../shared/ui";

type PeriodInput = {
  register: UseFormRegisterReturn;
  error?: string;
};

type ReportPeriodFieldsProps = {
  start: PeriodInput;
  end: PeriodInput;
  disabled?: boolean;
};

export function ReportPeriodFields({
  start,
  end,
  disabled,
}: ReportPeriodFieldsProps) {
  return (
    <>
      <FormField
        htmlFor="start_date"
        label="Начало периода отчёта"
        required
        error={start.error}
      >
        <Input
          id="start_date"
          type="date"
          disabled={disabled}
          aria-invalid={Boolean(start.error)}
          {...start.register}
        />
      </FormField>

      <FormField
        htmlFor="end_date"
        label="Конец периода отчёта"
        required
        error={end.error}
      >
        <Input
          id="end_date"
          type="date"
          disabled={disabled}
          aria-invalid={Boolean(end.error)}
          {...end.register}
        />
      </FormField>
    </>
  );
}
