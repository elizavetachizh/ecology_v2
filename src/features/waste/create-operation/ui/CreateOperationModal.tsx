import { useState } from "react";
import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import {
  OPERATION_TYPE_LABEL,
  OperationTypeValues,
  useCurrentBalanceQuery,
  type Operation,
} from "../../../../entities/waste/operations";
import { useUnitsOptions, type Unit } from "../../../../entities/waste/units";
import { useWasteSourcesOptions } from "../../../../entities/waste/waste-sources";
import {
  HAZARD_CLASS_LABEL,
  UOM_LABEL,
  useWastesOptions,
  type Waste,
} from "../../../../entities/waste/wastes";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AsyncCombobox,
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
import { useUpsertOperationForm } from "../model/use-upsert-operation-form";

const UPSERT_OPERATION_STEPS = [
  { id: 1, title: "Структурная единица" },
  { id: 2, title: "Отход" },
  { id: 3, title: "Данные операции" },
] as const;

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

function wasteLabel(waste: Pick<Waste, "waste_classifier">) {
  return `${waste.waste_classifier.code} — ${waste.waste_classifier.name}`;
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
  });
  const wastes = useWastesOptions({ tenantId: activeTenantId, enabled: true });
  const sources = useWasteSourcesOptions({
    tenantId: activeTenantId,
    enabled: operationType === "formed",
  });

  const selectedUnit =
    units.options.find((item) => item.id === unitId) ??
    (initial?.unit_id === unitId ? initial.unit : null);

  const selectedWaste =
    wastes.options.find((item) => item.id === wasteId) ??
    (initial?.waste_id === wasteId ? initial.waste : null);

  const selectedSource =
    sources.options.find((item) => item.id === wasteSourceId) ??
    (initial?.waste_source_id === wasteSourceId
      ? initial.waste_source
      : null);

  const goNext = async () => {
    const fields = step === 1 ? (["unit_id"] as const) : (["waste_id"] as const);
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

          <CurrentBalanceHint
            tenantId={activeTenantId}
            unitId={unitId}
            wasteId={wasteId}
            uomLabel={selectedWaste ? UOM_LABEL[selectedWaste.uom] : undefined}
          />

          {step === 1 ? (
            <Field>
              <FieldLabel htmlFor="unit_id" required>
                Структурная единица
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
                    onValueChange={(id) => field.onChange(id)}
                    placeholder="Выберите структурную единицу…"
                    searchPlaceholder="Поиск по названию или краткому"
                    emptyMessage={
                      units.loading
                        ? "Загрузка…"
                        : "Ничего не найдено. Создайте структурную единицу в справочнике или уточните поиск."
                    }
                    search={units.search}
                    setSearch={units.setSearch}
                    className="w-full"
                    contentClassName="w-full"
                    aria-label="Структурная единица"
                    disabled={pending}
                  />
                )}
              />
              <FieldError>{errors.unit_id?.message}</FieldError>
            </Field>
          ) : null}

          {step === 2 ? (
            <>
              <Field>
                <FieldLabel htmlFor="waste_id" required>
                  Отход
                </FieldLabel>
                <Controller
                  name="waste_id"
                  control={control}
                  render={({ field }) => (
                    <AsyncCombobox
                      options={wastes.options.map((waste) => ({
                        value: waste.id,
                        label: wasteLabel(waste),
                      }))}
                      value={field.value}
                      selectedLabel={
                        selectedWaste ? wasteLabel(selectedWaste) : undefined
                      }
                      onValueChange={(id) => field.onChange(id)}
                      placeholder="Выберите отход из справочника"
                      searchPlaceholder="Поиск по коду или названию"
                      emptyMessage={
                        wastes.loading
                          ? "Загрузка…"
                          : "Начните вводить код или название"
                      }
                      search={wastes.search}
                      setSearch={wastes.setSearch}
                      className="w-full"
                      contentClassName="w-full"
                      aria-label="Отход"
                      disabled={pending}
                    />
                  )}
                />
                <FieldDescription>
                  Нет нужного отхода?{" "}
                  <Link
                    to="/directories/wastes/new"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Создать в справочнике
                  </Link>
                </FieldDescription>
                <FieldError>{errors.waste_id?.message}</FieldError>
              </Field>

              {selectedWaste ? (
                <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      Класс опасности:{" "}
                    </span>
                    {HAZARD_CLASS_LABEL[selectedWaste.hazard_class]}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ед. изм.: </span>
                    {UOM_LABEL[selectedWaste.uom]}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Field>
                <FieldLabel htmlFor="operation-date" required>
                  Дата операции
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
                        options={sources.options.map((source) => ({
                          value: source.id,
                          label: source.name,
                        }))}
                        value={field.value}
                        selectedLabel={selectedSource?.name}
                        onValueChange={(id) => field.onChange(id)}
                        placeholder="Выберите источник образования"
                        searchPlaceholder="Поиск источника"
                        emptyMessage={
                          sources.loading
                            ? "Загрузка…"
                            : "Источники не найдены"
                        }
                        search={sources.search}
                        setSearch={sources.setSearch}
                        className="w-full"
                        contentClassName="w-full"
                        aria-label="Источник образования"
                        disabled={pending}
                      />
                    )}
                  />
                  <FieldDescription>
                    Нет нужного источника?{" "}
                    <Link
                      to="/directories/waste-sources"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Создать в справочнике
                    </Link>
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
