import { Controller } from "react-hook-form";
import {
  HAZARD_CLASS_LABEL,
  HazardClassValues,
  PHYSICAL_STATE_LABEL,
  PhysicalStateValues,
  UOM_LABEL,
  UomValues,
  type Waste,
} from "../../../../entities/waste/wastes";
import {
  Alert,
  AlertDescription,
  Button,
  FieldLabel,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { WasteClassifierSelect } from "../../select-waste-classifier";
import { useUpsertWasteForm } from "../model/use-upsert-waste-form";

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

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow="Справочники / Отходы"
        title={
          mode === "create"
            ? "Новый отход"
            : (initial?.waste_classifier.name ?? "Отход")
        }
      />

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        {error ? (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-1.5 md:col-span-2">
          <FieldLabel htmlFor="waste_classifier_id">
            Отход из классификатора
          </FieldLabel>
          <Controller
            name="waste_classifier_id"
            control={control}
            render={({ field }) => (
              <WasteClassifierSelect
                value={field.value ? String(field.value) : ""}
                selectedLabel={
                  field.value === initial?.waste_classifier_id
                    ? `${initial.waste_classifier.code} — ${initial.waste_classifier.name}`
                    : undefined
                }
                onChange={(item) => field.onChange(item?.id ?? 0)}
              />
            )}
          />
          {errors.waste_classifier_id && (
            <span className="text-xs text-destructive">
              {errors.waste_classifier_id.message}
            </span>
          )}
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="hazard_class">Класс опасности</FieldLabel>
          <Select id="hazard_class" {...register("hazard_class")}>
            {HazardClassValues.map((value) => (
              <option key={value} value={value}>
                {HAZARD_CLASS_LABEL[value]}
              </option>
            ))}
          </Select>
          {errors.hazard_class && (
            <span className="text-xs text-destructive">
              {errors.hazard_class.message}
            </span>
          )}
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="uom">Единица измерения</FieldLabel>
          <Select id="uom" {...register("uom")}>
            {UomValues.map((value) => (
              <option key={value} value={value}>
                {UOM_LABEL[value]}
              </option>
            ))}
          </Select>
          {errors.uom && (
            <span className="text-xs text-destructive">
              {errors.uom.message}
            </span>
          )}
        </div>

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="physical_state">Агрегатное состояние</FieldLabel>
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
          {errors.physical_state && (
            <span className="text-xs text-destructive">
              {errors.physical_state.message}
            </span>
          )}
        </div>
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
          Отмена
        </Button>
      </div>
    </form>
  );
}
