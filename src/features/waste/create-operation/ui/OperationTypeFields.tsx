import { useMemo, useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { CounterpartySelect } from "../../../../entities/waste/counterparties";
import {
  NEUTRALIZATION_METHOD_LABEL,
  NeutralizationMethodValues,
  TRANSFER_RECEIPT_PURPOSE_LABEL,
  TransferReceiptPurposeValues,
  USE_PURPOSE_LABEL,
  UsePurposeValues,
  type Operation,
} from "../../../../entities/waste/operations";
import {
  DEFAULT_PASSPORTS_LIST_LIMIT,
  usePassportsListQuery,
} from "../../../../entities/waste/passports";
import {
  DEFAULT_TTNS_LIST_LIMIT,
  useTtnsListQuery,
} from "../../../../entities/waste/ttns";
import type { UnitTree } from "../../../../entities/waste/units";
import type { WasteSourceBrief } from "../../../../entities/waste/waste-sources";
import {
  Alert,
  AlertDescription,
  AsyncCombobox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Select,
} from "../../../../shared/ui";
import {
  isInternalTransferType,
  OperationDocumentKindValues,
  type OperationFormValues,
} from "../model/operation-form.schema";
import { OperationUnitPicker } from "./OperationUnitPicker";

type OperationTypeFieldsProps = {
  tenantId: string | null;
  control: Control<OperationFormValues>;
  setValue: UseFormSetValue<OperationFormValues>;
  errors: FieldErrors<OperationFormValues>;
  pending: boolean;
  operationType: OperationFormValues["operation_type"];
  unitId: string;
  wasteId: string;
  documentKind: OperationFormValues["document_kind"];
  tree: UnitTree[];
  unitsLoading: boolean;
  unitsError: Error | null;
  initial?: Operation | null;
  bindingSources: WasteSourceBrief[];
  directorySources: {
    options: WasteSourceBrief[];
    loading: boolean;
    search: string;
    setSearch: (value: string) => void;
  };
  selectedSource: WasteSourceBrief | null | undefined;
};

const DOCUMENT_KIND_LABEL = {
  passport: "Сопроводительный паспорт",
  ttn: "ТТН",
} as const;

function documentLabel(item: { number: string; date: string }) {
  return `№${item.number} от ${item.date}`;
}

function OperationPassportSelect({
  tenantId,
  unitId,
  wasteId,
  value,
  fallbackLabel,
  disabled,
  onChange,
}: {
  tenantId: string | null;
  unitId: string;
  wasteId: string;
  value: string;
  fallbackLabel?: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const query = usePassportsListQuery({
    tenantId,
    enabled: Boolean(tenantId && unitId && wasteId),
    params: {
      unit_id: unitId,
      status: "active",
      limit: DEFAULT_PASSPORTS_LIST_LIMIT,
      offset: 0,
      sort: "number",
      order: "asc",
    },
  });

  const items = useMemo(
    () =>
      query.items.filter((item) =>
        item.wastes.some((waste) => waste.waste_id === wasteId),
      ),
    [query.items, wasteId],
  );

  const needle = search.trim().toLowerCase();
  const options = needle
    ? items.filter((item) => documentLabel(item).toLowerCase().includes(needle))
    : items;

  const selected = items.find((item) => item.id === value);

  return (
    <AsyncCombobox
      options={options.map((item) => ({
        value: item.id,
        label: documentLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? documentLabel(selected) : fallbackLabel}
      onValueChange={onChange}
      placeholder="Выберите сопроводительный паспорт"
      searchPlaceholder="Поиск по номеру"
      emptyMessage={
        query.loading
          ? "Загрузка…"
          : needle
            ? "Ничего не найдено"
            : "Нет действующих паспортов с этим отходом"
      }
      search={search}
      setSearch={setSearch}
      disabled={disabled || query.loading}
      className="w-full"
      contentClassName="w-full"
      aria-label="Сопроводительный паспорт"
    />
  );
}

function OperationTtnSelect({
  tenantId,
  unitId,
  value,
  fallbackLabel,
  disabled,
  onChange,
}: {
  tenantId: string | null;
  unitId: string;
  value: string;
  fallbackLabel?: string;
  disabled?: boolean;
  onChange: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const query = useTtnsListQuery({
    tenantId,
    enabled: Boolean(tenantId && unitId),
    params: {
      unit_id: unitId,
      status: "active",
      limit: DEFAULT_TTNS_LIST_LIMIT,
      offset: 0,
      sort: "number",
      order: "asc",
    },
  });

  const needle = search.trim().toLowerCase();
  const options = needle
    ? query.items.filter((item) =>
        documentLabel(item).toLowerCase().includes(needle),
      )
    : query.items;

  const selected = query.items.find((item) => item.id === value);

  return (
    <AsyncCombobox
      options={options.map((item) => ({
        value: item.id,
        label: documentLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? documentLabel(selected) : fallbackLabel}
      onValueChange={onChange}
      placeholder="Выберите ТТН"
      searchPlaceholder="Поиск по номеру"
      emptyMessage={
        query.loading
          ? "Загрузка…"
          : needle
            ? "Ничего не найдено"
            : "Нет действующих ТТН на этом месте учёта"
      }
      search={search}
      setSearch={setSearch}
      disabled={disabled || query.loading}
      className="w-full"
      contentClassName="w-full"
      aria-label="ТТН"
    />
  );
}

export function OperationTypeFields({
  tenantId,
  control,
  setValue,
  errors,
  pending,
  operationType,
  unitId,
  wasteId,
  documentKind,
  tree,
  unitsLoading,
  unitsError,
  initial,
  bindingSources,
  directorySources,
  selectedSource,
}: OperationTypeFieldsProps) {
  const useBindingSources = bindingSources.length > 0;
  const sourceOptions = useBindingSources
    ? bindingSources
    : directorySources.options;

  if (operationType === "formed") {
    return (
      <Field>
        <FieldLabel htmlFor="waste_source_id" required>
          Источник образования
        </FieldLabel>
        {useBindingSources ? (
          <Controller
            name="waste_source_id"
            control={control}
            render={({ field }) => (
              <Select
                id="waste_source_id"
                className="w-full"
                disabled={pending}
                aria-invalid={Boolean(errors.waste_source_id)}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
              >
                <option value="">Выберите источник образования</option>
                {sourceOptions.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.name}
                  </option>
                ))}
              </Select>
            )}
          />
        ) : (
          <Controller
            name="waste_source_id"
            control={control}
            render={({ field }) => (
              <AsyncCombobox
                options={sourceOptions.map((source) => ({
                  value: source.id,
                  label: source.name,
                }))}
                value={field.value}
                selectedLabel={selectedSource?.name}
                onValueChange={(id) => field.onChange(id)}
                placeholder="Выберите источник образования"
                searchPlaceholder="Поиск источника"
                emptyMessage={
                  directorySources.loading
                    ? "Загрузка…"
                    : "Источники не найдены"
                }
                search={directorySources.search}
                setSearch={directorySources.setSearch}
                className="w-full"
                contentClassName="w-full"
                aria-label="Источник образования"
                disabled={pending}
              />
            )}
          />
        )}
        <FieldDescription>
          {useBindingSources ? (
            <>
              Источники из привязки отхода к этому месту учёта. Нет нужного?{" "}
              <Link
                to="/directories/waste-sources"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Открыть справочник
              </Link>
            </>
          ) : (
            <>
              Нет нужного источника?{" "}
              <Link
                to="/directories/waste-sources"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Создать в справочнике
              </Link>
            </>
          )}
        </FieldDescription>
        <FieldError>{errors.waste_source_id?.message}</FieldError>
      </Field>
    );
  }

  if (operationType === "used") {
    return (
      <Field>
        <FieldLabel htmlFor="use_purpose" required>
          Цель использования
        </FieldLabel>
        <Controller
          name="use_purpose"
          control={control}
          render={({ field }) => (
            <Select
              id="use_purpose"
              className="w-full"
              disabled={pending}
              aria-invalid={Boolean(errors.use_purpose)}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            >
              <option value="">Выберите цель</option>
              {UsePurposeValues.map((value) => (
                <option key={value} value={value}>
                  {USE_PURPOSE_LABEL[value]}
                </option>
              ))}
            </Select>
          )}
        />
        <FieldError>{errors.use_purpose?.message}</FieldError>
      </Field>
    );
  }

  if (operationType === "neutralized") {
    return (
      <Field>
        <FieldLabel htmlFor="neutralization_method" required>
          Способ обезвреживания
        </FieldLabel>
        <Controller
          name="neutralization_method"
          control={control}
          render={({ field }) => (
            <Select
              id="neutralization_method"
              className="w-full"
              disabled={pending}
              aria-invalid={Boolean(errors.neutralization_method)}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
            >
              <option value="">Выберите способ</option>
              {NeutralizationMethodValues.map((value) => (
                <option key={value} value={value}>
                  {NEUTRALIZATION_METHOD_LABEL[value]}
                </option>
              ))}
            </Select>
          )}
        />
        <FieldError>{errors.neutralization_method?.message}</FieldError>
      </Field>
    );
  }

  if (isInternalTransferType(operationType)) {
    const sideLabel =
      operationType === "received_in" ? "Откуда поступило" : "Куда передано";

    return (
      <>
        <Controller
          name="unit_side_id"
          control={control}
          render={({ field }) => (
            <OperationUnitPicker
              tree={tree}
              loading={unitsLoading}
              error={unitsError}
              value={field.value}
              excludeUnitId={unitId}
              fallbackUnit={
                initial?.unit_side_id === field.value ? initial.unit_side : null
              }
              onChange={field.onChange}
              disabled={pending}
              errorMessage={errors.unit_side_id?.message}
              htmlFor="unit_side_id"
              label={sideLabel}
              placeholder="Выберите структурное подразделение…"
              aria-label={sideLabel}
              description="Другой журнал ПОД-9. Нельзя выбрать то же место учёта."
            />
          )}
        />
        <TransferReceiptPurposeField
          control={control}
          errors={errors}
          pending={pending}
        />
        {operationType === "transferred_in" ? (
          <Alert variant="info">
            <AlertDescription>
              Будет создана парная операция поступления. Остатки изменятся после
              подтверждения принимающей стороной.
            </AlertDescription>
          </Alert>
        ) : null}
      </>
    );
  }

  if (operationType === "received_out") {
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
                tenantId={tenantId}
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
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Открыть справочник
            </Link>
          </FieldDescription>
          <FieldError>{errors.counterparty_id?.message}</FieldError>
        </Field>
        <TransferReceiptPurposeField
          control={control}
          errors={errors}
          pending={pending}
        />
      </>
    );
  }

  if (operationType === "transferred_out") {
    return (
      <>
        <TransferReceiptPurposeField
          control={control}
          errors={errors}
          pending={pending}
        />
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
                <OperationPassportSelect
                  tenantId={tenantId}
                  unitId={unitId}
                  wasteId={wasteId}
                  value={field.value}
                  fallbackLabel={
                    initial?.passport_id === field.value
                      ? initial.passport
                        ? documentLabel(initial.passport)
                        : undefined
                      : undefined
                  }
                  disabled={pending}
                  onChange={field.onChange}
                />
              )}
            />
            <FieldDescription>
              Действующий паспорт с этим отходом на выбранном месте учёта. Нет
              нужного?{" "}
              <Link
                to="/waste/passports/new"
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
                <OperationTtnSelect
                  tenantId={tenantId}
                  unitId={unitId}
                  value={field.value}
                  fallbackLabel={
                    initial?.ttn_id === field.value
                      ? initial.ttn
                        ? documentLabel(initial.ttn)
                        : undefined
                      : undefined
                  }
                  disabled={pending}
                  onChange={field.onChange}
                />
              )}
            />
            <FieldDescription>
              Действующая ТТН на этом месте учёта. Состав отходов договора
              проверяет сервер. Нет нужной?{" "}
              <Link
                to="/waste/ttns/new"
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

  return null;
}

function TransferReceiptPurposeField({
  control,
  errors,
  pending,
}: {
  control: Control<OperationFormValues>;
  errors: FieldErrors<OperationFormValues>;
  pending: boolean;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="transfer_receipt_purpose" required>
        Цель передачи или поступления
      </FieldLabel>
      <Controller
        name="transfer_receipt_purpose"
        control={control}
        render={({ field }) => (
          <Select
            id="transfer_receipt_purpose"
            className="w-full"
            disabled={pending}
            aria-invalid={Boolean(errors.transfer_receipt_purpose)}
            value={field.value}
            onChange={(event) => field.onChange(event.target.value)}
          >
            <option value="">Выберите цель</option>
            {TransferReceiptPurposeValues.map((value) => (
              <option key={value} value={value}>
                {TRANSFER_RECEIPT_PURPOSE_LABEL[value]}
              </option>
            ))}
          </Select>
        )}
      />
      <FieldError>{errors.transfer_receipt_purpose?.message}</FieldError>
    </Field>
  );
}
