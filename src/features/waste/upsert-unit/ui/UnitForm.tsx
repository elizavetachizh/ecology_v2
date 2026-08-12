import { Controller } from "react-hook-form";
import type { Unit } from "../../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FormSection,
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
  /** Предзаполнение флага ПОД-9 из ?isPod9= */
  defaultIsPod9?: boolean;
  activeTenantId: string | null;
  initial?: Unit | null;
  onSaved: (unit: Unit, meta: { close: boolean }) => void;
  onCancel: () => void;
  showNextStepCta?: boolean;
};

export function UnitForm({
  mode,
  unitId,
  defaultParentId,
  defaultIsPod9 = false,
  activeTenantId,
  initial,
  onSaved,
  onCancel,
  showNextStepCta: _showNextStepCta,
}: UnitFormProps) {
  const { form, error, pending, onSubmit, successMessage } = useUpsertUnitForm({
    mode,
    unitId,
    defaultParentId,
    defaultIsPod9,
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
  const isPod9 = watch("is_pod9");

  return (
    <form
      className="mx-auto max-w-4xl space-y-6"
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
    >
      {successMessage ? (
        <Alert variant="success">
          <AlertTitle>Сохранено</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <PageContextBar
        eyebrow="Справочники / Структурные единицы"
        title={
          mode === "create"
            ? defaultIsPod9
              ? "Новая единица ПОД-9"
              : "Новая структурная единица"
            : (initial?.name ?? "Структурная единица")
        }
        description={
          defaultIsPod9
            ? "Создание журнала ПОД-9: родитель выбран, флаг ПОД-9 включён. Укажите наименование и при необходимости территорию."
            : "Создание структурной единицы: укажите наименование, родителя и при необходимости территорию."
        }
        actions={isPod9 ? <Badge variant="info">ПОД-9</Badge> : undefined}
      />

      {error ? (
        <Alert variant="error">
          <AlertTitle>Не удалось сохранить</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FormSection
        title="Основные сведения"
        description="Как подразделение будет отображаться в списках и дереве структуры."
      >
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
            Короткий код для таблиц и выбора в формах (до 255 символов).
          </FieldDescription>
          <FieldError>{errors.short_name?.message}</FieldError>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="parent_id" required={isPod9}>
            Родительская единица
          </FieldLabel>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <ParentUnitSelect
                tenantId={activeTenantId}
                value={field.value}
                excludeUnitId={unitId}
                required={isPod9}
                onChange={(unit) => field.onChange(unit?.id ?? "")}
              />
            )}
          />
          <FieldDescription id="parent-hint">
            {isPod9
              ? "Для учёта ПОД-9 родитель обязателен: объект ПОД-9 всегда входит в существующее подразделение."
              : "Оставьте пустым, если создаёте корневую единицу организации. Для вложенных подразделений и журналов ПОД-9 выберите родителя."}
          </FieldDescription>
          <FieldError>{errors.parent_id?.message}</FieldError>
        </Field>

        <>
          <div className="space-y-1 md:col-span-2">
            <h2 className="text-sm font-semibold text-foreground">
              Территориальная принадлежность
            </h2>

            <p className="text-sm text-muted-foreground">
              Необязательно. Нужна для отчётности и фильтров по региону/району.
            </p>
          </div>

          <Field>
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
            <FieldDescription>
              Выберите регион, чтобы открыть список районов.
            </FieldDescription>
            <FieldError>{errors.region_id?.message}</FieldError>
          </Field>

          <Field>
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
              <div className="flex h-9 items-center rounded-md border border-dashed border-border px-3 text-sm text-muted-foreground">
                Сначала выберите регион
              </div>
            )}
            <FieldDescription>
              Район зависит от выбранного региона и сбрасывается при его смене.
            </FieldDescription>
            <FieldError>{errors.district_id?.message}</FieldError>
          </Field>
        </>
      </FormSection>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать единицу"
              : "Сохранить изменения"}
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
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
