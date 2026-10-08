import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import type { Person } from "../../../../entities/waste/persons";
import { useTenant } from "../../../../entities/tenant";
import {
  flattenUnitTreePaths,
  formatUnitPathLabel,
  unitLabel,
  useUnitsTreeQuery,
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
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const units = useUnitsTreeQuery({
    tenantId: activeTenantId,
    params: { sort: "name", order: "asc" },
    enabled: Boolean(activeTenantId),
  });

  const {
    control,
    register,

    formState: { errors },
  } = form;

  const entries = useMemo(() => {
    return flattenUnitTreePaths(units.tree, { pod9Only: true });
  }, [units.tree]);

  const unitOptions = useMemo(
    () =>
      entries.map((item) => ({
        value: item.unit.id,
        label: formatUnitPathLabel(item.path),
      })),
    [entries],
  );

  const selectedUnitOptions = useMemo(() => {
    const byValue = new Map(
      (initial?.units ?? []).map((unit) => [
        unit.id,
        { value: unit.id, label: unitLabel(unit) },
      ]),
    );
    for (const option of unitOptions) byValue.set(option.value, option);
    return [...byValue.values()];
  }, [initial?.units, unitOptions]);

  const filteredOptions = useMemo(() => {
    if (!query) return unitOptions;
    return entries.flatMap((item, index) => {
      const pathLabel = formatUnitPathLabel(item.path).toLowerCase();
      const shortName = item.unit.short_name?.toLowerCase() ?? "";
      return pathLabel.includes(query) || shortName.includes(query)
        ? [unitOptions[index]]
        : [];
    });
  }, [entries, query, unitOptions]);

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

      <div className="grid items-start gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-3">
        {error ? (
          <Alert variant="error" className="md:col-span-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          className="md:col-span-3"
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
          className="md:col-span-3"
          htmlFor="unit_ids"
          label="ПОД-9"
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
                id="unit_ids"
                options={filteredOptions}
                selectedOptions={selectedUnitOptions}
                value={field.value}
                onValueChange={(next) => field.onChange(dedupeIds(next))}
                search={search}
                setSearch={setSearch}
                onRefresh={() => {
                  void units.refetch();
                }}
                refreshing={units.fetching}
                disabled={pending}
                maxVisibleValues={4}
                placeholder="Выберите ПОД-9, за которые сотрудник является ответственным"
                searchPlaceholder="Поиск ПОД-9"
                emptyMessage={
                  units.loading ? "Загрузка…" : "Подразделения не найдены"
                }
                aria-label="ПОД-9"
              />
            )}
          />
        </FormField>
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
