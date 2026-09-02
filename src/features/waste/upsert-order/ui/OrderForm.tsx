import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  OrderStatusBadge,
  type Order,
} from "../../../../entities/waste/orders";
import { useTenant } from "../../../../entities/tenant";
import { UnitSelect } from "../../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  Button,
  DirectoryBreadcrumb,
  FormField,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import { useUpsertOrderForm } from "../model/use-upsert-order-form";
import { routes } from "../../../../shared/config/routes";

type OrderFormProps = {
  mode: "create" | "edit";
  orderId?: string;
  initial?: Order | null;
  onSaved: (order: Order, meta: { close: boolean }) => void;
  onCancel: () => void;
};

export function OrderForm({
  mode,
  orderId,
  initial,
  onSaved,
  onCancel,
}: OrderFormProps) {
  const { activeTenantId } = useTenant();
  const { form, error, pending, onSubmit } = useUpsertOrderForm({
    mode,
    orderId,
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
        eyebrow={
          <DirectoryBreadcrumb
            directoryLabel="Приказы"
            directoryTo={routes.directories.orders.list}
            current={
              mode === "create"
                ? "Новый приказ"
                : `Приказ ${initial?.number ?? ""}`
            }
          />
        }
        title={
          mode === "create" ? "Новый приказ" : `Приказ ${initial?.number ?? ""}`
        }
        actions={
          mode === "edit" && initial ? (
            <OrderStatusBadge status={initial.status} />
          ) : null
        }
      />

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid items-start gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <FormField
          htmlFor="number"
          label="Номер приказа"
          required
          className="md:col-span-2"
          error={errors.number?.message}
        >
          <Input
            id="number"
            {...register("number")}
            placeholder="12-ОД"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
          />
        </FormField>

        <FormField
          htmlFor="unit_id"
          label="Подразделение"
          required
          className="md:col-span-2"
          error={errors.unit_id?.message}
          description={
            <>
              На одно подразделение и дату начала — один приказ. Нет нужного
              места учёта?{" "}
              <Link
                to={routes.directories.units.list}
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
            name="unit_id"
            control={control}
            render={({ field }) => (
              <UnitSelect
                tenantId={activeTenantId}
                value={field.value}
                disabled={pending}
                placeholder="Выберите подразделение"
                onChange={field.onChange}
              />
            )}
          />
        </FormField>

        <FormField
          htmlFor="start_date"
          label="Дата начала действия"
          required
          error={errors.start_date?.message}
          description="Документ бессрочный. Действующим считается приказ с максимальной датой начала, не позже сегодняшней, по подразделению."
        >
          <Input
            id="start_date"
            type="date"
            {...register("start_date")}
            disabled={pending}
            aria-invalid={Boolean(errors.start_date)}
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
