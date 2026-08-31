import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { TtnStatusBadge, type Ttn } from "../../../../entities/waste/ttns";
import { useTenant } from "../../../../entities/tenant";
import { ContractSelect } from "../../../../entities/waste/contracts";
import { UnitSelect } from "../../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  FormField,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import { useUpsertTtnForm } from "../model/use-upsert-ttn-form";
import { routes } from "../../../../shared/config/routes";

type TtnFormProps = {
  mode: "create" | "edit";
  ttnId?: string;
  initial?: Ttn | null;
  defaultRecyclingContractId?: string;
  onSaved: (ttn: Ttn) => void;
  onCancel: () => void;
};

export function TtnForm({
  mode,
  ttnId,
  initial,
  defaultRecyclingContractId,
  onSaved,
  onCancel,
}: TtnFormProps) {
  const { activeTenantId } = useTenant();
  const { form, error, pending, onSubmit } = useUpsertTtnForm({
    mode,
    ttnId,
    initial,
    defaultRecyclingContractId,
    onSaved,
  });
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow="Отходы / ТТН"
        title={
          mode === "create"
            ? "Новая товарно-транспортная накладная"
            : `ТТН ${initial?.number ?? ""}`
        }
        actions={<TtnStatusBadge status={initial?.status ?? "active"} />}
      />

      <Alert variant="info">
        <AlertTitle>Документы ведутся отдельно</AlertTitle>
        <AlertDescription>
          ТТН не связан с сопроводительным паспортом — документы ведутся
          отдельно. Нужен действующий договор утилизации. Удаление договора, на
          который есть ТТН, запрещено.
        </AlertDescription>
      </Alert>

      {error ? (
        <Alert variant="error">
          <AlertTitle>Не удалось сохранить</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <FormField
          htmlFor="number"
          label="Номер"
          required
          error={errors.number?.message}
        >
          <Input
            id="number"
            {...register("number")}
            placeholder="ТТН-001"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
          />
        </FormField>
        <FormField
          htmlFor="date"
          label="Дата перевозки"
          required
          error={errors.date?.message}
        >
          <Input
            id="date"
            type="date"
            {...register("date")}
            disabled={pending}
            aria-invalid={Boolean(errors.date)}
          />
        </FormField>
        <FormField
          htmlFor="unit_id"
          label="Структурная единица"
          required
          className="md:col-span-2"
          error={errors.unit_id?.message}
        >
          <Controller
            name="unit_id"
            control={control}
            render={({ field }) => (
              <UnitSelect
                tenantId={activeTenantId}
                value={field.value}
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
        <FormField
          htmlFor="recycling_contract_id"
          label="Договор утилизации"
          required
          className="md:col-span-2"
          error={errors.recycling_contract_id?.message}
          description={
            <>
              Только действующие договоры типа «Утилизация». Нет договора?{" "}
              <Link
                to={routes.directories.contracts.new}
                search={activeTenantId ? { tenant: activeTenantId } : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Создать в справочнике
              </Link>
            </>
          }
        >
          <Controller
            name="recycling_contract_id"
            control={control}
            render={({ field }) => (
              <ContractSelect
                tenantId={activeTenantId}
                value={field.value}
                contractType="recycling"
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать ТТН"
              : "Сохранить"}
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
