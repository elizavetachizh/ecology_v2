import { Controller, useFormContext } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useTenant } from "../../../../../entities/tenant";
import { CounterpartySelect } from "../../../../../entities/waste/counterparties";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Switch,
} from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";
import { TransferReceiptPurposeField } from "./TransferReceiptPurposeField";
import { routes } from "../../../../../shared/config/routes";

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
            to={routes.directories.counterparties.list}
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
      <Field>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <FieldLabel htmlFor="is_import">По импорту</FieldLabel>
            <FieldDescription>
              В отчёте 1-отходы попадает в колонку «поступило… из них по
              импорту».
            </FieldDescription>
          </div>
          <Controller
            name="is_import"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_import"
                checked={field.value}
                disabled={pending}
                onCheckedChange={field.onChange}
                aria-label="По импорту"
              />
            )}
          />
        </div>
      </Field>
    </>
  );
}
