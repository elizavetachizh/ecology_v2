import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  DISPOSAL_FACILITY_TYPE_LABEL,
  STORAGE_FACILITY_TYPE_LABEL,
  TRANSFER_PURPOSE_LABEL,
  TransferPurposeValues,
} from "../../../../entities/waste/contracts";
import {
  Field,
  FieldDescription,
  FieldLabel,
  FormField,
  Input,
  Select,
  Switch,
} from "../../../../shared/ui";
import {
  applyOwnershipEnabled,
  applyTransferPurposeChange,
} from "../model/apply-contract-form-rules";
import type { ContractFormValues } from "../model/contract-form.schema";
import {
  facilityKind,
  ownershipEditable,
  type FacilityKind,
} from "../model/contract-form-rules";

const FACILITY_FIELD = {
  storage: {
    name: "storage_facility_type",
    label: "Тип объекта хранения",
    options: STORAGE_FACILITY_TYPE_LABEL,
  },
  disposal: {
    name: "disposal_facility_type",
    label: "Тип объекта захоронения",
    options: DISPOSAL_FACILITY_TYPE_LABEL,
  },
} as const satisfies Record<
  FacilityKind,
  {
    name: "storage_facility_type" | "disposal_facility_type";
    label: string;
    options: Record<string, string>;
  }
>;

type ContractRecyclingFieldsProps = {
  form: UseFormReturn<ContractFormValues>;
  pending: boolean;
};

export function ContractRecyclingFields({
  form,
  pending,
}: ContractRecyclingFieldsProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const transferPurpose = watch("transfer_purpose");
  const withOwnershipTransfer = watch("with_ownership_transfer");
  const canEditOwnership = ownershipEditable(transferPurpose);
  const kind = facilityKind(transferPurpose, withOwnershipTransfer);
  const facility = kind ? FACILITY_FIELD[kind] : null;

  return (
    <>
      <FormField
        htmlFor="transfer_purpose"
        label="Цель передачи"
        required
        className="md:col-span-2"
        error={errors.transfer_purpose?.message}
      >
        <Select
          id="transfer_purpose"
          disabled={pending}
          {...register("transfer_purpose", {
            onChange: (event) => {
              applyTransferPurposeChange(
                setValue,
                transferPurpose,
                event.target.value,
              );
            },
          })}
          aria-invalid={Boolean(errors.transfer_purpose)}
        >
          <option value="">Выберите цель</option>
          {TransferPurposeValues.map((value) => (
            <option key={value} value={value}>
              {TRANSFER_PURPOSE_LABEL[value]}
            </option>
          ))}
        </Select>
      </FormField>

      {canEditOwnership ? (
        <Field className="md:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <FieldLabel htmlFor="with_ownership_transfer">
                С передачей права собственности
              </FieldLabel>
              <FieldDescription>
                {canEditOwnership || !transferPurpose
                  ? "Отходы передаются с переходом права собственности."
                  : null}
              </FieldDescription>
            </div>
            <Controller
              name="with_ownership_transfer"
              control={control}
              render={({ field }) => (
                <Switch
                  id="with_ownership_transfer"
                  checked={canEditOwnership ? field.value : true}
                  disabled={pending || !canEditOwnership}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) applyOwnershipEnabled(setValue);
                  }}
                  aria-label="С передачей права собственности"
                />
              )}
            />
          </div>
        </Field>
      ) : null}
      {facility ? (
        <FormField
          htmlFor={facility.name}
          label={facility.label}
          required
          className="md:col-span-2"
          error={errors[facility.name]?.message}
        >
          <Select
            id={facility.name}
            disabled={pending}
            {...register(facility.name)}
            aria-invalid={Boolean(errors[facility.name])}
          >
            <option value="">Выберите тип объекта</option>
            {Object.entries(facility.options).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      ) : null}
      <FormField
        htmlFor="amount"
        label="Сумма вывоза отходов по договору"
        className="md:col-span-2"
        error={errors.amount?.message}
      >
        <Input
          id="amount"
          {...register("amount")}
          inputMode="decimal"
          placeholder="необязательно"
          disabled={pending}
          aria-invalid={Boolean(errors.amount)}
        />
      </FormField>
    </>
  );
}
