import {
  VEHICLE_STATUS_LABEL,
  VehicleStatusValues,
  type Vehicle,
} from "../../../../entities/waste/vehicles";
import {
  Alert,
  AlertDescription,
  Button,
  DirectoryBreadcrumb,
  FormField,
  Input,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";
import { useUpsertVehicleForm } from "../model/use-upsert-vehicle-form";

type VehicleFormProps = {
  mode: "create" | "edit";
  vehicleId?: string;
  initial?: Vehicle | null;
  onSaved: (vehicle: Vehicle, meta: { close: boolean }) => void;
  onCancel: () => void;
};

function vehicleHeading(
  mode: "create" | "edit",
  initial?: Vehicle | null,
): string {
  if (mode === "create") return "Новое транспортное средство";
  if (!initial) return "Транспортное средство";
  return `${initial.make} ${initial.model}`.trim();
}

export function VehicleForm({
  mode,
  vehicleId,
  initial,
  onSaved,
  onCancel,
}: VehicleFormProps) {
  const { form, error, pending, onSubmit } = useUpsertVehicleForm({
    mode,
    vehicleId,
    initial,
    onSaved,
  });

  const {
    register,
    formState: { errors },
  } = form;
  const heading = vehicleHeading(mode, initial);

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow={
          <DirectoryBreadcrumb
            directoryLabel="Транспортные средства"
            directoryTo={routes.directories.vehicles.list}
            current={heading}
          />
        }
        title={heading}
      />

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid items-start gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <FormField
          htmlFor="make"
          label="Марка"
          required
          error={errors.make?.message}
        >
          <Input
            id="make"
            {...register("make")}
            placeholder="МАЗ"
            autoFocus
            disabled={pending}
            aria-invalid={Boolean(errors.make)}
          />
        </FormField>

        <FormField
          htmlFor="model"
          label="Модель"
          required
          error={errors.model?.message}
        >
          <Input
            id="model"
            {...register("model")}
            placeholder="5551"
            disabled={pending}
            aria-invalid={Boolean(errors.model)}
          />
        </FormField>

        <FormField
          htmlFor="license_plate"
          label="Госномер"
          required
          error={errors.license_plate?.message}
        >
          <Input
            id="license_plate"
            {...register("license_plate")}
            placeholder="1234 AB-7"
            disabled={pending}
            aria-invalid={Boolean(errors.license_plate)}
          />
        </FormField>

        <FormField
          htmlFor="weight"
          label="Масса"
          error={errors.weight?.message}
        >
          <Input
            id="weight"
            inputMode="numeric"
            {...register("weight")}
            placeholder="12000"
            disabled={pending}
            aria-invalid={Boolean(errors.weight)}
          />
        </FormField>

        <FormField
          htmlFor="status"
          label="Статус"
          required
          error={errors.status?.message}
        >
          <Select id="status" disabled={pending} {...register("status")}>
            {VehicleStatusValues.map((value) => (
              <option key={value} value={value}>
                {VEHICLE_STATUS_LABEL[value]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor="beltopgas_id"
          label="ID Белтопгаз"
          error={errors.beltopgas_id?.message}
        >
          <Input
            id="beltopgas_id"
            inputMode="numeric"
            {...register("beltopgas_id")}
            placeholder="1001"
            disabled={pending}
            aria-invalid={Boolean(errors.beltopgas_id)}
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
