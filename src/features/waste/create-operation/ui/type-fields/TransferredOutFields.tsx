import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useTenant } from "../../../../../entities/tenant";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../../../shared/ui";
import {
  OperationDocumentKindValues,
  type OperationFormValues,
} from "../../model/operation-form.schema";
import { DocumentCombobox } from "../DocumentCombobox";
import { TransferReceiptPurposeField } from "./TransferReceiptPurposeField";
import { routes } from "../../../../../shared/config/routes";

const DOCUMENT_KIND_LABEL = {
  passport: "Сопроводительный паспорт",
  ttn: "ТТН",
} as const;

type TransferredOutFieldsProps = {
  pending: boolean;
};

export function TransferredOutFields({ pending }: TransferredOutFieldsProps) {
  const { activeTenantId } = useTenant();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<OperationFormValues>();
  const unitId = useWatch<OperationFormValues, "unit_id">({ name: "unit_id" });
  const wasteId = useWatch<OperationFormValues, "waste_id">({
    name: "waste_id",
  });
  const documentKind = useWatch<OperationFormValues, "document_kind">({
    name: "document_kind",
  });

  return (
    <>
      <TransferReceiptPurposeField pending={pending} />
      <Field>
        <p
          id="document-kind-label"
          className="text-sm font-medium leading-none text-foreground"
        >
          Документ
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        </p>
        <Controller
          name="document_kind"
          control={control}
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-labelledby="document-kind-label"
              aria-invalid={Boolean(errors.document_kind)}
              className="flex flex-wrap gap-x-6 gap-y-2"
            >
              {OperationDocumentKindValues.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <input
                    type="radio"
                    name={field.name}
                    value={value}
                    checked={field.value === value}
                    disabled={pending}
                    className="size-4 accent-primary disabled:cursor-not-allowed"
                    onBlur={field.onBlur}
                    onChange={() => {
                      field.onChange(value);
                      setValue("passport_id", "");
                      setValue("ttn_id", "");
                    }}
                  />
                  {DOCUMENT_KIND_LABEL[value]}
                </label>
              ))}
            </div>
          )}
        />
        <FieldDescription>
          Для вывоза указывается ровно один документ.
        </FieldDescription>
        <FieldError>{errors.document_kind?.message}</FieldError>
      </Field>
      {documentKind === "passport" ? (
        <Field>
          <FieldLabel htmlFor="passport_id" required>
            Сопроводительный паспорт
          </FieldLabel>
          <Controller
            name="passport_id"
            control={control}
            render={({ field }) => (
              <DocumentCombobox
                kind="passport"
                tenantId={activeTenantId}
                unitId={unitId}
                wasteId={wasteId}
                value={field.value}
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            Действующий паспорт с этим отходом на выбранном месте учёта. Нет
            нужного?{" "}
            <Link
              to={routes.waste.passports.new}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Создать сопроводительный паспорт
            </Link>
          </FieldDescription>
          <FieldError>{errors.passport_id?.message}</FieldError>
        </Field>
      ) : null}
      {documentKind === "ttn" ? (
        <Field>
          <FieldLabel htmlFor="ttn_id" required>
            ТТН
          </FieldLabel>
          <Controller
            name="ttn_id"
            control={control}
            render={({ field }) => (
              <DocumentCombobox
                kind="ttn"
                tenantId={activeTenantId}
                unitId={unitId}
                value={field.value}
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            Действующая ТТН на этом месте учёта. Состав отходов договора
            проверяет сервер. Нет нужной?{" "}
            <Link
              to={routes.waste.ttns.new}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Создать ТТН
            </Link>
          </FieldDescription>
          <FieldError>{errors.ttn_id?.message}</FieldError>
        </Field>
      ) : null}
    </>
  );
}
