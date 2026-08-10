import { Controller } from "react-hook-form";
import type { Unit } from "../../../../entities/waste/units";
import { useTenant } from "../../../../app/providers/tenant/tenant-context";
import {
  Alert,
  AlertDescription,
  Button,
  FieldLabel,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import { DistrictClassifierSelect } from "../../select-district-classifier";
import { RegionClassifierSelect } from "../../select-region-classifier";
import { useUpsertUnitForm } from "../model/use-upsert-unit-form";
import { ParentUnitSelect } from "./ParentUnitSelect";

type UnitFormProps = {
  mode: "create" | "edit";
  unitId?: string;
  /** Предзаполнение родителя из ?parentId= */
  defaultParentId?: string;
  initial?: Unit | null;
  onSaved: (unit: Unit, meta: { close: boolean }) => void;
  onCancel: () => void;
  showNextStepCta?: boolean;
};

export function UnitForm({
  mode,
  unitId,
  defaultParentId,
  initial,
  onSaved,
  onCancel,
  showNextStepCta: _showNextStepCta,
}: UnitFormProps) {
  const { activeTenantId } = useTenant();
  const { form, error, pending, onSubmit, successMessage } = useUpsertUnitForm({
    mode,
    unitId,
    defaultParentId,
    initial,
    onSaved,
  });

  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const regionId = watch("region_id");

  return (
    <form
      className="mx-auto max-w-4xl space-y-6"
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
    >
      {successMessage && (
        <Alert variant="success">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <PageContextBar
        eyebrow="Справочники / Структурные единицы"
        title={
          mode === "create"
            ? "Новая структурная единица"
            : "Структурная единица"
        }
        description="Укажите наименование, родителя в иерархии и территориальную принадлежность."
      />
      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="name">Название</FieldLabel>
          <Input
            id="name"
            placeholder="Например: Цех №1, Площадка накопления…"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-xs text-destructive">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="short_name">Короткое название</FieldLabel>
          <Input
            id="short_name"
            placeholder="Ц-1"
            {...register("short_name")}
          />
          {errors.short_name && (
            <span className="text-xs text-destructive">
              {errors.short_name.message}
            </span>
          )}
        </div>

        <div className="grid gap-1.5 md:col-span-2">
          <FieldLabel htmlFor="parent_id">Родительская единица</FieldLabel>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <ParentUnitSelect
                tenantId={activeTenantId}
                value={field.value}
                excludeUnitId={unitId}
                onChange={(unit) => field.onChange(unit?.id ?? "")}
              />
            )}
          />
          {errors.parent_id && (
            <span className="text-xs text-destructive">
              {errors.parent_id.message}
            </span>
          )}
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="region_id">Регион</FieldLabel>
          <Controller
            name="region_id"
            control={control}
            render={({ field }) => (
              <RegionClassifierSelect
                value={field.value != null ? String(field.value) : ""}
                selectedLabel={
                  field.value === initial?.region?.id
                    ? (initial?.region?.name ?? undefined)
                    : undefined
                }
                onChange={(item) => {
                  field.onChange(item?.id);
                  setValue("district_id", undefined, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            )}
          />
          {errors.region_id && (
            <span className="text-xs text-destructive">
              {errors.region_id.message}
            </span>
          )}
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="district_id">Район</FieldLabel>
          {regionId != null ? (
            <Controller
              name="district_id"
              control={control}
              render={({ field }) => (
                <DistrictClassifierSelect
                  region_id={regionId}
                  value={field.value != null ? String(field.value) : ""}
                  selectedLabel={
                    field.value === initial?.district?.id
                      ? (initial?.district?.name ?? undefined)
                      : undefined
                  }
                  onChange={(item) => field.onChange(item?.id)}
                />
              )}
            />
          ) : (
            <p className="flex h-9 items-center text-sm text-muted-foreground">
              Сначала выберите регион
            </p>
          )}
          {errors.district_id && (
            <span className="text-xs text-destructive">
              {errors.district_id.message}
            </span>
          )}
        </div>

        {error && (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-2 pt-1 md:col-span-2">
          <Button type="submit" disabled={pending}>
            Сохранить
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              void form.handleSubmit((values) => onSubmit(true, values))()
            }
          >
            Сохранить и закрыть
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </div>
    </form>
  );
}
