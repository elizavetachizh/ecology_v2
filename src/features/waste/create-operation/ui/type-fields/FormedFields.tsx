import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useTenant } from "../../../../../entities/tenant";
import type { Operation } from "../../../../../entities/waste/operations";
import {
  useWasteSourcesOptions,
  type WasteSourceBrief,
} from "../../../../../entities/waste/waste-sources";
import {
  AsyncCombobox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Select,
} from "../../../../../shared/ui";
import type { OperationFormValues } from "../../model/operation-form.schema";

type FormedFieldsProps = {
  pending: boolean;
  bindingSources: WasteSourceBrief[];
  initial?: Operation | null;
};

export function FormedFields({
  pending,
  bindingSources,
  initial,
}: FormedFieldsProps) {
  const { activeTenantId } = useTenant();
  const {
    control,
    formState: { errors },
  } = useFormContext<OperationFormValues>();
  const wasteSourceId = useWatch<OperationFormValues, "waste_source_id">({
    name: "waste_source_id",
  });

  const useBindingSources = bindingSources.length > 0;
  const sources = useWasteSourcesOptions({
    tenantId: activeTenantId,
    enabled: !useBindingSources,
  });
  const sourceOptions = useBindingSources ? bindingSources : sources.options;
  const selectedSource =
    sourceOptions.find((item) => item.id === wasteSourceId) ??
    (initial?.waste_source_id === wasteSourceId ? initial.waste_source : null);

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
                sources.loading ? "Загрузка…" : "Источники не найдены"
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
