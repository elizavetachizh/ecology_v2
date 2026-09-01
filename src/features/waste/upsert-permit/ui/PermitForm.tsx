import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import type { Permit } from "../../../../entities/waste/permits";
import { useTenant } from "../../../../entities/tenant";
import { UnitSelect } from "../../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  DirectoryBreadcrumb,
  FormField,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import { useUpsertPermitForm } from "../model/use-upsert-permit-form";
import { PermitBurialWastesEditor } from "./PermitBurialWastesEditor";
import { routes } from "../../../../shared/config/routes";

type PermitFormProps = {
  mode: "create" | "edit";
  permitId?: string;
  initial?: Permit | null;
  onSaved: (permit: Permit, meta: { close: boolean }) => void;
  onCancel: () => void;
};

export function PermitForm({
  mode,
  permitId,
  initial,
  onSaved,
  onCancel,
}: PermitFormProps) {
  const { activeTenantId } = useTenant();
  const { form, error, pending, onSubmit } = useUpsertPermitForm({
    mode,
    permitId,
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
            directoryLabel="Разрешения"
            directoryTo={routes.directories.permits.list}
            current={
              mode === "create"
                ? "Новое разрешение"
                : `Разрешение ${initial?.number ?? ""}`
            }
          />
        }
        title={
          mode === "create"
            ? "Новое разрешение"
            : `Разрешение ${initial?.number ?? ""}`
        }
        actions={
          mode === "edit" &&
          (initial?.status === "active" ? (
            <Badge variant="success">Действует</Badge>
          ) : initial?.status === "inactive" ? (
            <Badge variant="secondary">Не действует</Badge>
          ) : null)
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
          label="Номер разрешения"
          required
          className="md:col-span-2"
          error={errors.number?.message}
        >
          <Input
            id="number"
            {...register("number")}
            placeholder="Р-001"
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
              Нет нужного места учёта?{" "}
              <Link
                target="_blank"
                rel="noopener noreferrer"
                to={routes.directories.units.list}
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
        >
          <Input
            id="start_date"
            type="date"
            {...register("start_date")}
            disabled={pending}
            aria-invalid={Boolean(errors.start_date)}
          />
        </FormField>

        <FormField
          htmlFor="end_date"
          label="Дата окончания"
          error={errors.end_date?.message}
        >
          <Input
            id="end_date"
            type="date"
            {...register("end_date")}
            disabled={pending}
            aria-invalid={Boolean(errors.end_date)}
          />
        </FormField>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Лимиты на захоронение
          </h2>
          <p className="text-sm text-muted-foreground">
            Не нашли нужного отхода?{" "}
            <Link
              to={routes.directories.wastes.list}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Справочник отходов
            </Link>
          </p>
        </div>
        <PermitBurialWastesEditor
          form={form}
          tenantId={activeTenantId}
          pending={pending}
        />
      </section>

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
