import { Link } from "@tanstack/react-router";
import type { Standard } from "../../../../entities/waste/standards";
import { useTenant } from "../../../../entities/tenant";
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
import { StandardUnitsEditor } from "./StandardUnitsEditor";
import { routes } from "../../../../shared/config/routes";

type StandardFormProps = {
  mode: "create" | "edit";
  standardId?: string;
  initial?: Standard | null;
  onSaved: (standard: Standard, meta: { close: boolean }) => void;
  onCancel: () => void;
};

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
    register,
    formState: { errors },
  } = form;

  const title =
    mode === "create"
      ? "Новый норматив"
      : initial
        ? `Норматив с ${formatDate(initial.start_date)}`
        : "Норматив";

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
            current={title}
          />
        }
        title={title}
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
          htmlFor="start_date"
          label="Дата начала действия"
          required
          error={errors.start_date?.message}
          description="Документ бессрочный. Действующим считается норматив с максимальной датой начала не позже сегодняшней. На одну дату начала в организации — один норматив."
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
            Места учёта и нормативы по отходам
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
        <StandardUnitsEditor
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
