import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { Unit } from "../../../../entities/waste/units";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "../../../../shared/ui";
import type { UnitFormValues } from "../model/unit-form.schema";
import { ParentUnitSelect } from "./ParentUnitSelect";

type UnitIdentityFieldsProps = {
  control: Control<UnitFormValues>;
  register: UseFormRegister<UnitFormValues>;
  errors: FieldErrors<UnitFormValues>;
  tenantId: string | null;
  unitId?: string;
  isPod9: boolean;
  onParentChange: (unit: Unit | null) => void;
};

export function UnitIdentityFields({
  control,
  register,
  errors,
  tenantId,
  unitId,
  isPod9,
  onParentChange,
}: UnitIdentityFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="name" required>
          Наименование
        </FieldLabel>
        <Input
          id="name"
          placeholder="Например: Цех №1, Участок сортировки…"
          aria-invalid={Boolean(errors.name)}
          aria-describedby="name-hint"
          {...register("name")}
        />
        <FieldDescription id="name-hint">
          Полное название для документов и отчётов.
        </FieldDescription>
        <FieldError>{errors.name?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="short_name" required>
          Краткое наименование
        </FieldLabel>
        <Input
          id="short_name"
          placeholder="Например: Ц-1"
          aria-invalid={Boolean(errors.short_name)}
          aria-describedby="short-name-hint"
          {...register("short_name")}
        />
        <FieldDescription id="short-name-hint">
          Короткий код для таблиц и выбора в формах.
        </FieldDescription>
        <FieldError>{errors.short_name?.message}</FieldError>
      </Field>

      <Field className="md:col-span-2">
        <FieldLabel htmlFor="parent_id" required={isPod9}>
          Родитель
        </FieldLabel>
        <Controller
          name="parent_id"
          control={control}
          render={({ field }) => (
            <ParentUnitSelect
              tenantId={tenantId}
              value={field.value}
              excludeUnitId={unitId}
              required={isPod9}
              onChange={(unit) => {
                field.onChange(unit?.id ?? "");
                onParentChange(unit);
              }}
            />
          )}
        />
        <FieldDescription id="parent-hint">
          {isPod9
            ? "Для учёта ПОД-9 родитель обязателен: объект ПОД-9 всегда входит в существующее подразделение. Регион и район подставляются от родителя."
            : "Оставьте пустым, если создаёте корневую единицу организации, например ПУ. При выборе родителя регион и район наследуются от него."}
        </FieldDescription>
        <FieldError>{errors.parent_id?.message}</FieldError>
      </Field>
    </>
  );
}
