import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useUnitsOptions, type Unit } from "../../../../entities/waste/units";
import { useWasteSourcesOptions } from "../../../../entities/waste/waste-sources";
import type {
  WasteInstructionUnit,
  WasteInstructionUnitScope,
} from "../../../../entities/waste/waste-instruction-units";
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
  MultipleCombobox,
} from "../../../../shared/ui";
import { useBindWiuForm } from "../model/use-bind-wiu-form";

type BindWiuModalProps = {
  open: boolean;
  mode: "create" | "edit";
  tenantId: string | null;
  scope: WasteInstructionUnitScope;
  initial?: WasteInstructionUnit | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (binding: WasteInstructionUnit) => void;
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

export function BindWiuModal({
  open,
  mode,
  tenantId,
  scope,
  initial,
  onOpenChange,
  onSaved,
}: BindWiuModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open ? (
        <BindWiuModalForm
          key={`${mode}-${initial?.id ?? "new"}`}
          mode={mode}
          tenantId={tenantId}
          scope={scope}
          initial={initial}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}

type BindWiuModalFormProps = Omit<BindWiuModalProps, "open">;

function BindWiuModalForm({
  mode,
  tenantId,
  scope,
  initial,
  onOpenChange,
  onSaved,
}: BindWiuModalFormProps) {
  const { form, error, pending, onSubmit } = useBindWiuForm({
    mode,
    scope,
    initial,
    onSaved,
  });

  const {
    control,
    register,
    formState: { errors },
  } = form;

  const units = useUnitsOptions({
    tenantId,
    enabled: true,
    limit: 20,
    is_pod9: true,
  });
  const sources = useWasteSourcesOptions({
    tenantId,
    enabled: true,
    limit: 50,
  });

  const selectedUnitId = form.watch("unit_id");
  const selectedUnit =
    units.options.find((item) => item.id === selectedUnitId) ??
    (initial?.unit_id === selectedUnitId ? initial.unit : null);

  return (
    <ModalContent className="max-w-lg">
      <form className="min-w-0" onSubmit={form.handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>
            {mode === "create"
              ? "Привязать журнал ПОД-9"
              : "Изменить привязку журнала ПОД-9"}
          </ModalTitle>
          <ModalDescription>
            Выберите журнал ПОД-9, укажите источники образования и транспортную
            единицу для этого отхода в рамках инструкции.
          </ModalDescription>
        </ModalHeader>

        <div className="grid min-w-0 gap-4 py-2">
          {error ? (
            <Alert variant="error">
              <AlertTitle>Не удалось сохранить</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Field>
            <FieldLabel htmlFor="unit_id" required>
              Журнал ПОД-9
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
                  onValueChange={(id) => field.onChange(id ?? "")}
                  placeholder="Выберите журнал ПОД-9"
                  searchPlaceholder="Поиск по названию или краткому"
                  emptyMessage={
                    units.loading
                      ? "Загрузка…"
                      : "Начните вводить название единицы"
                  }
                  search={units.search}
                  setSearch={units.setSearch}
                  className="w-full"
                  aria-label="Структурная единица ПОД-9"
                />
              )}
            />
            <FieldDescription>
              Нет нужного журнала?{" "}
              <Link
                to="/directories/units"
                search={tenantId ? { tenant: tenantId } : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Открыть структуру
              </Link>
            </FieldDescription>
            <FieldError>{errors.unit_id?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="waste_source_ids">
              Источники образования
            </FieldLabel>
            <Controller
              name="waste_source_ids"
              control={control}
              render={({ field }) => (
                <MultipleCombobox
                  options={sources.options.map((source) => ({
                    value: source.id,
                    label: source.name,
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  search={sources.search}
                  setSearch={sources.setSearch}
                  placeholder="Необязательно — выберите источники"
                  searchPlaceholder="Поиск источника"
                  emptyMessage={
                    sources.loading ? "Загрузка…" : "Источники не найдены"
                  }
                  aria-label="Источники образования"
                />
              )}
            />
            <FieldDescription>
              Можно выбрать несколько. Нет нужного источника?{" "}
              <Link
                to="/directories/waste-sources"
                search={tenantId ? { tenant: tenantId } : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Создать в справочнике
              </Link>
            </FieldDescription>
            <FieldError>{errors.waste_source_ids?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="transport_unit" required>
              Транспортная единица
            </FieldLabel>
            <Input
              id="transport_unit"
              inputMode="decimal"
              placeholder="0"
              aria-invalid={Boolean(errors.transport_unit)}
              {...register("transport_unit")}
            />
            <FieldDescription>
              Число от 0 до 999999.999999, до 6 знаков после запятой. По
              умолчанию 0.
            </FieldDescription>
            <FieldError>{errors.transport_unit?.message}</FieldError>
          </Field>
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
          <Button type="submit" disabled={pending}>
            {pending
              ? "Сохранение…"
              : mode === "create"
                ? "Привязать"
                : "Сохранить"}
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
}
