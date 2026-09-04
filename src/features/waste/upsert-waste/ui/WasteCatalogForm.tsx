import { Controller } from "react-hook-form";
import {
  HAZARD_CLASS_LABEL,
  HazardClassValues,
  PHYSICAL_STATE_LABEL,
  PhysicalStateValues,
  UOM_LABEL,
  UomValues,
  wasteLabel,
  type Waste,
} from "../../../../entities/waste/wastes";
import {
  Alert,
  AlertDescription,
  Button,
  DirectoryBreadcrumb,
  FormField,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { WasteClassifierSelect } from "../../select-waste-classifier";
import { useUpsertWasteForm } from "../model/use-upsert-waste-form";
import { routes } from "../../../../shared/config/routes";

type WasteCatalogFormProps = {
  mode: "create" | "edit";
  wasteId?: string;
  initial?: Waste | null;
  onSaved: (waste: Waste, meta: { close: boolean }) => void;
  onCancel: () => void;
};

export function WasteCatalogForm({
  mode,
  wasteId,
  initial,
  onSaved,
  onCancel,
}: WasteCatalogFormProps) {
  const { form, error, pending, onSubmit } = useUpsertWasteForm({
    mode,
    wasteId,
    initial,
    onSaved,
  });

  const {
    control,
    register,
    formState: { errors },
  } = form;
  const title =
    mode === "create"
      ? "Новый отход"
      : (initial?.waste_classifier.name ?? "Отход");

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow={
          <DirectoryBreadcrumb
            directoryLabel="Отходы"
            directoryTo={routes.directories.wastes.list}
            current={title}
          />
        }
        title={title}
      />

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        {error ? (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <FormField
          htmlFor="waste_classifier_id"
          label="Отход из классификатора"
          required
          className="md:col-span-2"
          error={errors.waste_classifier_id?.message}
        >
          <Controller
            name="waste_classifier_id"
            control={control}
            render={({ field }) => (
              <WasteClassifierSelect
                value={field.value ? String(field.value) : ""}
                selectedLabel={
                  field.value === initial?.waste_classifier_id
                    ? wasteLabel(initial)
                    : undefined
                }
                onChange={(item) => field.onChange(item?.id ?? 0)}
              />
            )}
          />
        </FormField>

        <FormField
          htmlFor="hazard_class"
          label="Класс опасности"
          error={errors.hazard_class?.message}
        >
          <Select id="hazard_class" {...register("hazard_class")}>
            {HazardClassValues.map((value) => (
              <option key={value} value={value}>
                {HAZARD_CLASS_LABEL[value]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor="uom"
          label="Единица измерения"
          error={errors.uom?.message}
        >
          <Select id="uom" {...register("uom")}>
            {UomValues.map((value) => (
              <option key={value} value={value}>
                {UOM_LABEL[value]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor="physical_state"
          label="Агрегатное состояние"
          error={errors.physical_state?.message}
        >
          <Select
            id="physical_state"
            {...register("physical_state", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
          >
            <option value="">Не указано</option>
            {PhysicalStateValues.map((value) => (
              <option key={value} value={value}>
                {PHYSICAL_STATE_LABEL[value]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать отход"
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
