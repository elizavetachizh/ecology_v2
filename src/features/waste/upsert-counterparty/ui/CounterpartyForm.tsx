import type { Counterparty } from "../../../../entities/waste/counterparties";
import {
  Badge,
  Button,
  DirectoryBreadcrumb,
  PageContextBar,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";
import { useUpsertCounterpartyForm } from "../model/use-upsert-counterparty-form";
import { CounterpartyFormFields } from "./CounterpartyFormFields";
import { CounterpartyNextStepCta } from "./CounterpartyNextStepCta";

type CounterpartyFormProps = {
  mode: "create" | "edit";
  counterpartyId?: string;
  initial?: Counterparty | null;
  onSaved: (counterparty: Counterparty, meta: { close: boolean }) => void;
  onCancel: () => void;
};

export function CounterpartyForm({
  mode,
  counterpartyId,
  initial,
  onSaved,
  onCancel,
}: CounterpartyFormProps) {
  const { form, error, pending, onSubmit } = useUpsertCounterpartyForm({
    mode,
    counterpartyId,
    initial,
    onSaved,
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow={
          <DirectoryBreadcrumb
            directoryLabel="Контрагенты"
            directoryTo={routes.directories.counterparties.list}
            current={
              mode === "create"
                ? "Новый контрагент"
                : (initial?.name ?? "Контрагент")
            }
          />
        }
        title={
          mode === "create"
            ? "Новый контрагент"
            : (initial?.name ?? "Контрагент")
        }
        actions={
          mode === "edit" ? (
            <Badge variant={initial?.is_active ? "success" : "outline"}>
              {initial?.is_active ? "Активен" : "Неактивен"}
            </Badge>
          ) : null
        }
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <CounterpartyFormFields form={form} pending={pending} error={error} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать"
              : "Сохранить"}
        </Button>{" "}
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
      {mode === "edit" && (
        <CounterpartyNextStepCta counterpartyId={counterpartyId} />
      )}
    </form>
  );
}
