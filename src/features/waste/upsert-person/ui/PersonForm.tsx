import { useState } from "react";
import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import type { Person } from "../../../../entities/waste/persons";
import { useTenant } from "../../../../entities/tenant";
import type { UserProfile } from "../../../../entities/user";
import {
  unitLabel,
  useUnitsOptions,
  type UnitBrief,
} from "../../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  Button,
  DirectoryBreadcrumb,
  FormField,
  Input,
  MultipleCombobox,
  PageContextBar,
  type MultipleComboboxOption,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";
import { useUpsertPersonForm } from "../model/use-upsert-person-form";

type PersonFormProps = {
  mode: "create" | "edit";
  personId?: string;
  initial?: Person | null;
  onSaved: (person: Person, meta: { close: boolean }) => void;
  onCancel: () => void;
};

function withUnitLabels(
  labels: ReadonlyMap<string, string>,
  units: readonly Pick<UnitBrief, "id" | "name" | "short_name">[],
): ReadonlyMap<string, string> {
  if (units.every((unit) => labels.has(unit.id))) return labels;
  const next = new Map(labels);
  for (const unit of units) {
    if (!next.has(unit.id)) next.set(unit.id, unitLabel(unit));
  }
  return next;
}

function personUnitComboboxOptions(
  selectedIds: readonly string[],
  labels: ReadonlyMap<string, string>,
  searched: readonly Pick<UnitBrief, "id" | "name" | "short_name">[],
): MultipleComboboxOption[] {
  const options: MultipleComboboxOption[] = [];
  const seen = new Set<string>();

  for (const id of selectedIds) {
    const label = labels.get(id);
    if (!label || seen.has(id)) continue;
    seen.add(id);
    options.push({ value: id, label });
  }

  for (const unit of searched) {
    if (seen.has(unit.id)) continue;
    seen.add(unit.id);
    options.push({
      value: unit.id,
      label: labels.get(unit.id) ?? unitLabel(unit),
    });
  }

  return options;
}

function linkedUserFio(
  user: Pick<UserProfile, "last_name" | "first_name">,
): string {
  return [user.last_name, user.first_name].filter(Boolean).join(" ");
}

function dedupeIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function PersonForm({
  mode,
  personId,
  initial,
  onSaved,
  onCancel,
}: PersonFormProps) {
  const { activeTenantId } = useTenant();
  const { form, error, pending, onSubmit } = useUpsertPersonForm({
    mode,
    personId,
    initial,
    onSaved,
  });
  const units = useUnitsOptions({
    tenantId: activeTenantId,
    enabled: Boolean(activeTenantId),
  });
  const [storedUnitLabels, setStoredUnitLabels] = useState(() =>
    withUnitLabels(new Map(), initial?.units ?? []),
  );
  const unitLabels = withUnitLabels(
    withUnitLabels(storedUnitLabels, initial?.units ?? []),
    units.options,
  );
  if (unitLabels !== storedUnitLabels) setStoredUnitLabels(unitLabels);

  const {
    control,
    register,
    watch,
    formState: { errors },
  } = form;
  const selectedUnitIds = watch("unit_ids");
  const unitOptions = personUnitComboboxOptions(
    selectedUnitIds,
    unitLabels,
    units.options,
  );
  const linkedUser = mode === "edit" ? (initial?.user ?? null) : null;
  const linkedFio = linkedUser ? linkedUserFio(linkedUser) : "";

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow={
          <DirectoryBreadcrumb
            directoryLabel="Ответственные"
            directoryTo={routes.directories.persons.list}
            current={
              mode === "create"
                ? "Новый ответственный"
                : (initial?.name ?? "Ответственный")
            }
          />
        }
        title={
          mode === "create"
            ? "Новый ответственный"
            : (initial?.name ?? "Ответственный")
        }
      />

      <div className="grid items-start gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        {error ? (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          className="md:col-span-2"
          htmlFor="name"
          label="ФИО полностью"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            {...register("name")}
            placeholder="Иванов И. И."
            autoFocus
            disabled={pending}
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>

        <FormField
          htmlFor="last_name"
          label="Фамилия"
          error={errors.last_name?.message}
        >
          <Input
            id="last_name"
            {...register("last_name")}
            placeholder="Иванов"
            disabled={pending}
            aria-invalid={Boolean(errors.last_name)}
          />
        </FormField>

        <FormField
          htmlFor="first_name"
          label="Имя"
          error={errors.first_name?.message}
        >
          <Input
            id="first_name"
            {...register("first_name")}
            placeholder="Иван"
            disabled={pending}
            aria-invalid={Boolean(errors.first_name)}
          />
        </FormField>

        <FormField
          htmlFor="middle_name"
          label="Отчество"
          error={errors.middle_name?.message}
        >
          <Input
            id="middle_name"
            {...register("middle_name")}
            placeholder="Иванович"
            disabled={pending}
            aria-invalid={Boolean(errors.middle_name)}
          />
        </FormField>

        <FormField
          className="md:col-span-2"
          htmlFor="unit_ids"
          label="Подразделения"
          error={errors.unit_ids?.message}
          description={
            <>
              Можно выбрать несколько. Нет нужного подразделения?{" "}
              <Link
                to={routes.directories.units.list}
                search={activeTenantId ? { tenant: activeTenantId } : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Открыть структуру
              </Link>
            </>
          }
        >
          <Controller
            name="unit_ids"
            control={control}
            render={({ field }) => (
              <MultipleCombobox
                options={unitOptions}
                value={field.value}
                onValueChange={(next) => field.onChange(dedupeIds(next))}
                search={units.search}
                setSearch={units.setSearch}
                onRefresh={() => {
                  void units.refetch();
                }}
                refreshing={units.refreshing}
                disabled={pending}
                placeholder="Выберите подразделения"
                searchPlaceholder="Поиск подразделения"
                emptyMessage={
                  units.loading ? "Загрузка…" : "Подразделения не найдены"
                }
                aria-label="Подразделения"
              />
            )}
          />
        </FormField>

        {linkedUser ? (
          <div className="grid gap-1.5 md:col-span-2">
            <p className="text-sm font-medium leading-none text-foreground">
              Пользователь
            </p>
            <p className="text-sm text-foreground">{linkedUser.username}</p>
            {linkedFio ? (
              <p className="text-sm text-muted-foreground">{linkedFio}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать"
              : "Сохранить"}
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
          Закрыть
        </Button>
      </div>
    </form>
  );
}
