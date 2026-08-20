import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import {
  OPERATION_TYPE_LABEL,
  OperationTypeValues,
  useCurrentBalanceQuery,
  type Operation,
} from "../../../../entities/waste/operations";
import {
  DEFAULT_UNITS_LIST_LIMIT,
  useUnitsOptions,
  type Unit,
} from "../../../../entities/waste/units";
import { useWasteSourcesOptions } from "../../../../entities/waste/waste-sources";
import {
  DEFAULT_UIW_LIST_LIMIT,
  DEFAULT_UNIT_INSTRUCTIONS_LIMIT,
  useUnitInstructionWastesListQuery,
  useUnitInstructionsListQuery,
} from "../../../../entities/waste/unit-instruction-waste";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AsyncCombobox,
  Badge,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
} from "../../../../shared/ui";
import { pickPreferredInstructionId } from "../model/pick-preferred-instruction";
import { useUpsertOperationForm } from "../model/use-upsert-operation-form";
import { OperationInstructionPicker } from "./OperationInstructionPicker";
import { OperationWastePicker } from "./OperationWastePicker";

const UPSERT_OPERATION_STEPS = [
  { id: 1, title: "Дата" },
  { id: 2, title: "Место учёта" },
  { id: 3, title: "Инструкция и отход" },
  { id: 4, title: "Данные операции" },
] as const;

const UNIT_INSTRUCTION_PARAMS = {
  limit: DEFAULT_UNIT_INSTRUCTIONS_LIMIT,
  offset: 0,
  sort: "name" as const,
  order: "asc" as const,
};

const UIW_LIST_PARAMS = {
  limit: DEFAULT_UIW_LIST_LIMIT,
  offset: 0,
};

type CreateOperationModalProps = {
  open: boolean;
  mode: "create" | "edit";
  initial?: Operation | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (operation: Operation) => void;
};

function unitLabel(unit: Pick<Unit, "name" | "short_name">) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

function renderPod9UnitOption(option: { value: string; label: string }) {
  return (
    <>
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      <Badge variant="info" className="shrink-0">
        ПОД-9
      </Badge>
    </>
  );
}

export function CreateOperationModal({
  open,
  mode,
  initial,
  onOpenChange,
  onSaved,
}: CreateOperationModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CreateOperationModalForm
          key={`${mode}-${initial?.id ?? "new"}`}
          mode={mode}
          initial={initial}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}

type CreateOperationModalFormProps = Omit<CreateOperationModalProps, "open">;

function CreateOperationModalForm({
  mode,
  initial,
  onOpenChange,
  onSaved,
}: CreateOperationModalFormProps) {
  const { activeTenantId } = useTenant();
  const [step, setStep] = useState(1);
  const [instructionId, setInstructionId] = useState<string | undefined>();
  const { form, error, pending, onSubmit } = useUpsertOperationForm({
    mode,
    initial,
    onSaved,
  });

  const {
    control,
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form;

  const unitId = watch("unit_id");
  const wasteId = watch("waste_id");
  const wasteSourceId = watch("waste_source_id");
  const operationType = watch("operation_type");

  const units = useUnitsOptions({
    tenantId: activeTenantId,
    enabled: true,
    limit: DEFAULT_UNITS_LIST_LIMIT,
    is_pod9: true,
  });

  const instructionsQuery = useUnitInstructionsListQuery({
    tenantId: activeTenantId,
    unitId,
    params: UNIT_INSTRUCTION_PARAMS,
    enabled: Boolean(unitId),
  });

  useEffect(() => {
    if (instructionsQuery.loading) return;
    const list = instructionsQuery.items;
    if (instructionId && list.some((item) => item.id === instructionId)) {
      return;
    }
    setInstructionId(pickPreferredInstructionId(list));
  }, [instructionId, instructionsQuery.loading, instructionsQuery.items]);

  const wastesQuery = useUnitInstructionWastesListQuery({
    tenantId: activeTenantId,
    scope: {
      unitId,
      instructionId: instructionId ?? "",
    },
    params: UIW_LIST_PARAMS,
    enabled: Boolean(unitId && instructionId),
  });

  const selectedBinding = wastesQuery.items.find(
    (item) => item.waste_id === wasteId,
  );
  const bindingSources = selectedBinding?.waste_sources ?? [];
  const useBindingSources = bindingSources.length > 0;

  const sources = useWasteSourcesOptions({
    tenantId: activeTenantId,
    enabled: operationType === "formed" && !useBindingSources,
  });

  const selectedUnit =
    units.options.find((item) => item.id === unitId) ??
    (initial?.unit_id === unitId ? initial.unit : null);

  const selectedWaste =
    selectedBinding?.waste ??
    (initial?.waste_id === wasteId ? initial.waste : null);

  const sourceOptions = useBindingSources ? bindingSources : sources.options;
  const selectedSource =
    sourceOptions.find((item) => item.id === wasteSourceId) ??
    (initial?.waste_source_id === wasteSourceId
      ? initial.waste_source
      : null);

  const resetInstructionAndWaste = () => {
    setInstructionId(undefined);
    setValue("waste_id", "");
    setValue("waste_source_id", "");
  };

  const goNext = async () => {
    const fields =
      step === 1
        ? (["date"] as const)
        : step === 2
          ? (["unit_id"] as const)
          : (["waste_id"] as const);
    const valid = await trigger(fields);
    if (valid) setStep((prev) => prev + 1);
  };

  const goBack = () => {
    form.clearErrors();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const lastStep = step >= UPSERT_OPERATION_STEPS.length;

  return (
    <ModalContent className="max-w-xl">
      <form
        onSubmit={
          lastStep
            ? form.handleSubmit(onSubmit)
            : (event) => {
                event.preventDefault();
                void goNext();
              }
        }
      >
        <ModalHeader>
          <ModalTitle>
            {mode === "create" ? "Создание операции" : "Изменение операции"}
          </ModalTitle>
          <ModalDescription>
            Шаг {step} из {UPSERT_OPERATION_STEPS.length}:{" "}
            {UPSERT_OPERATION_STEPS[step - 1]?.title}
          </ModalDescription>
        </ModalHeader>

        <div className="flex gap-2">
          {UPSERT_OPERATION_STEPS.map((item) => (
            <div
              key={item.id}
              className={`h-1.5 flex-1 rounded-full ${
                item.id <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="grid gap-4 py-2">
          {error ? (
            <Alert variant="error">
              <AlertTitle>Не удалось сохранить</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {step === 1 ? (
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
          ) : null}

          {step === 2 ? (
            <Field>
              <FieldLabel htmlFor="unit_id" required>
                Место учёта
              </FieldLabel>
              <Controller
                name="unit_id"
                control={control}
                render={({ field }) => (
                  <AsyncCombobox
                    options={units.options.map((unit) => ({
                      value: unit.id,
                      label: unitLabel(unit),
                    }))}
                    value={field.value}
                    selectedLabel={
                      selectedUnit ? unitLabel(selectedUnit) : undefined
                    }
                    renderOption={(option) => renderPod9UnitOption(option)}
                    renderValue={(option) => renderPod9UnitOption(option)}
                    onValueChange={(id) => {
                      const next = id ?? "";
                      if (next !== field.value) {
                        resetInstructionAndWaste();
                      }
                      field.onChange(next);
                    }}
                    placeholder="Выберите место учёта…"
                    searchPlaceholder="Поиск по названию или краткому"
                    emptyMessage={
                      units.loading
                        ? "Загрузка…"
                        : "Нет мест учёта. Добавьте место учёта в структуре организации."
                    }
                    search={units.search}
                    setSearch={units.setSearch}
                    className="w-full"
                    contentClassName="w-full"
                    aria-label="Место учёта"
                    disabled={pending}
                  />
                )}
              />
              <FieldDescription>
                Только узлы, на которых ведётся учёт отходов (ПОД-9). Нет нужного
                места?{" "}
                <Link
                  to="/directories/units"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Открыть структуру
                </Link>
              </FieldDescription>
              <FieldError>{errors.unit_id?.message}</FieldError>
            </Field>
          ) : null}

          {step === 3 ? (
            <>
              <OperationInstructionPicker
                key={unitId}
                unitId={unitId}
                instructions={instructionsQuery.items}
                loading={instructionsQuery.loading}
                error={instructionsQuery.error}
                value={instructionId}
                onChange={(nextId) => {
                  if (nextId === instructionId) return;
                  setInstructionId(nextId);
                  setValue("waste_id", "");
                  setValue("waste_source_id", "");
                }}
                disabled={pending}
              />
              {instructionId ? (
                <OperationWastePicker
                  key={instructionId}
                  unitId={unitId}
                  items={wastesQuery.items}
                  total={wastesQuery.total}
                  loading={wastesQuery.loading}
                  error={wastesQuery.error}
                  value={wasteId}
                  selectedWaste={selectedWaste}
                  onChange={(nextWasteId) => {
                    setValue("waste_id", nextWasteId, { shouldValidate: true });
                    setValue("waste_source_id", "");
                  }}
                  disabled={pending}
                  errorMessage={errors.waste_id?.message}
                />
              ) : null}
            </>
          ) : null}

          {step === 4 ? (
            <>
              <CurrentBalanceHint
                tenantId={activeTenantId}
                unitId={unitId}
                wasteId={wasteId}
                uomLabel={selectedWaste ? UOM_LABEL[selectedWaste.uom] : undefined}
              />

              <Field>
                <FieldLabel htmlFor="operation-type" required>
                  Тип операции
                </FieldLabel>
                <Select
                  id="operation-type"
                  className="w-full"
                  disabled={pending}
                  aria-invalid={Boolean(errors.operation_type)}
                  {...register("operation_type", {
                    onChange: (event) => {
                      if (event.target.value === "used") {
                        setValue("waste_source_id", "");
                      }
                    },
                  })}
                >
                  <option value="">Выберите тип</option>
                  {OperationTypeValues.map((type) => (
                    <option key={type} value={type}>
                      {OPERATION_TYPE_LABEL[type]}
                    </option>
                  ))}
                </Select>
                <FieldError>{errors.operation_type?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="amount" required>
                  Количество
                  {selectedWaste ? ` (${UOM_LABEL[selectedWaste.uom]})` : ""}
                </FieldLabel>
                <Input
                  id="amount"
                  inputMode="decimal"
                  placeholder="0"
                  disabled={pending}
                  aria-invalid={Boolean(errors.amount)}
                  {...register("amount")}
                />
                <FieldDescription>
                  Число больше 0, до 6 знаков после запятой.
                </FieldDescription>
                <FieldError>{errors.amount?.message}</FieldError>
              </Field>

              {operationType === "formed" ? (
                <Field>
                  <FieldLabel htmlFor="waste_source_id" required>
                    Источник образования
                  </FieldLabel>
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
                          useBindingSources
                            ? "К этой привязке источники не указаны"
                            : sources.loading
                              ? "Загрузка…"
                              : "Источники не найдены"
                        }
                        search={useBindingSources ? "" : sources.search}
                        setSearch={
                          useBindingSources ? () => undefined : sources.setSearch
                        }
                        className="w-full"
                        contentClassName="w-full"
                        aria-label="Источник образования"
                        disabled={pending}
                      />
                    )}
                  />
                  <FieldDescription>
                    {useBindingSources
                      ? "Источники из привязки отхода к этому месту учёта."
                      : (
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
              ) : null}
            </>
          ) : null}
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={goBack}
            >
              Назад
            </Button>
          ) : null}
          {lastStep ? (
            <Button type="submit" disabled={pending}>
              {pending
                ? "Сохранение…"
                : mode === "create"
                  ? "Создать операцию"
                  : "Сохранить"}
            </Button>
          ) : (
            <Button type="submit" disabled={pending}>
              Далее
            </Button>
          )}
        </ModalFooter>
      </form>
    </ModalContent>
  );
}

function CurrentBalanceHint({
  tenantId,
  unitId,
  wasteId,
  uomLabel,
}: {
  tenantId: string | null;
  unitId: string;
  wasteId: string;
  uomLabel?: string;
}) {
  const enabled = Boolean(unitId && wasteId);
  const { balance, loading, error } = useCurrentBalanceQuery({
    tenantId,
    unitId,
    wasteId,
    enabled,
  });

  if (!enabled) return null;

  const text = loading
    ? "Загрузка текущего остатка…"
    : error
      ? "Не удалось загрузить текущий остаток"
      : balance
        ? `Текущий остаток: ${balance.amount}${uomLabel ? ` ${uomLabel}` : ""}`
        : null;

  if (!text) return null;

  return (
    <Alert variant="info">
      <AlertDescription>{text}</AlertDescription>
    </Alert>
  );
}
