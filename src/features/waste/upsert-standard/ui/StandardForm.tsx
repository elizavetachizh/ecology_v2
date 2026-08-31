import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import type { Standard } from "../../../../entities/waste/standards";
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
import { formatDate } from "../../../../shared/lib/format-date";
import { useUpsertStandardForm } from "../model/use-upsert-standard-form";
import { StandardWastesEditor } from "./StandardWastesEditor";
import { routes } from "../../../../shared/config/routes";

type StandardFormProps = {
  mode: "create" | "edit";
  standardId?: string;
  initial?: Standard | null;
  onSaved: (standard: Standard, meta: { close: boolean }) => void;
  onCancel: () => void;
};

function unitTitle(unit: Standard["unit"]) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

export function StandardForm({
  mode,
  standardId,
  initial,
  onSaved,
  onCancel,
}: StandardFormProps) {
  const { activeTenantId } = useTenant();
  const { form, error, pending, onSubmit } = useUpsertStandardForm({
    mode,
    standardId,
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
            directoryLabel="Нормативы"
            directoryTo={routes.directories.standards.list}
            current={
              mode === "create"
                ? "Новый норматив"
                : initial
                  ? `${unitTitle(initial.unit)} · с ${formatDate(initial.start_date)}`
                  : "Норматив"
            }
          />
        }
        title={
          mode === "create"
            ? "Новый норматив"
            : initial
              ? `${unitTitle(initial.unit)} · с ${formatDate(initial.start_date)}`
              : "Норматив"
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
          htmlFor="unit_id"
          label="Подразделение"
          required
          className="md:col-span-2"
          error={errors.unit_id?.message}
          description={
            <>
              На одно подразделение и дату начала — один норматив. Нет нужного
              места учёта?{" "}
              <Link
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
          description="Документ бессрочный. Действующим считается норматив с максимальной датой начала, не позже сегодняшней, по подразделению."
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

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Нормативы по отходам
          </h2>
          <p className="text-sm text-muted-foreground">
            Пустой перечень при сохранении очищает список (полная замена).{" "}
            <Link
              to={routes.directories.wastes.list}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Справочник отходов
            </Link>
          </p>
        </div>
        <StandardWastesEditor
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
