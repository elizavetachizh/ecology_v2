import { Controller, useFormContext } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useTenant } from "../../../../../entities/tenant";
import { CounterpartySelect } from "../../../../../entities/waste/counterparties";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";
import { TransferReceiptPurposeField } from "./TransferReceiptPurposeField";

type ReceivedOutFieldsProps = {
  pending: boolean;
  tenantId: string | null;
};

export function ReceivedOutFields({
  pending,
  tenantId,
}: ReceivedOutFieldsProps) {
  const { activeTenantId } = useTenant();
  const {
    control,
    formState: { errors },
  } = useFormContext<OperationFormValues>();

  return (
    <>
      <Field>
        <FieldLabel htmlFor="counterparty_id" required>
          Контрагент
        </FieldLabel>
        <Controller
          name="counterparty_id"
          control={control}
          render={({ field }) => (
            <CounterpartySelect
              tenantId={activeTenantId}
              value={field.value}
              onChange={field.onChange}
              disabled={pending}
              aria-label="Контрагент"
            />
          )}
        />
        <FieldDescription>
          Нет нужного контрагента?{" "}
          <Link
            to="/directories/counterparties"
            search={tenantId ? { tenant: tenantId } : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Открыть справочник
          </Link>
        </FieldDescription>
        <FieldError>{errors.counterparty_id?.message}</FieldError>
      </Field>
      <TransferReceiptPurposeField pending={pending} />
    </>
  );
}
