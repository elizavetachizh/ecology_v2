import { useState } from "react";
import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  CONTRACT_TYPE_LABEL,
  ContractTypeValues,
  type Contract,
} from "../../../../entities/waste/contracts";
import { useTenant } from "../../../../entities/tenant";
import { CounterpartySelect } from "../../../../entities/waste/counterparties";
import { CounterpartyFormModal } from "../../upsert-counterparty";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  FormField,
  Input,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { useUpsertContractForm } from "../model/use-upsert-contract-form";
import { ContractNextStepCta } from "./ContractNextStepCta";
import { ContractWastesEditor } from "./ContractWastesEditor";

type ContractFormProps = {
  mode: "create" | "edit";
  contractId?: string;
  initial?: Contract | null;
  onSaved: (contract: Contract) => void;
  onCancel: () => void;
  tenantId: string | null;
};

export function ContractForm({
  mode,
  contractId,
  initial,
  tenantId,
  onSaved,
  onCancel,
}: ContractFormProps) {
  const { activeTenantId } = useTenant();
  const [counterpartyModalOpen, setCounterpartyModalOpen] = useState(false);
  const { form, error, pending, onSubmit } = useUpsertContractForm({
    mode,
    contractId,
    initial,
    onSaved,
  });
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const contractType = watch("contract_type");
  const status = watch("status");
  const wastes = watch("wastes");

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow="Справочники / Договоры"
        title={
          mode === "create"
            ? "Новый договор"
            : `Договор ${initial?.number ?? ""}`
        }
        actions={
          mode === "edit" &&
          (initial?.status === "active" ? (
            <Badge variant="success">Действует</Badge>
          ) : initial?.status === "inactive" ? (
            <Badge variant="destructive">Не действует</Badge>
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
          htmlFor="contract_type"
          label="Тип договора"
          required
          className="md:col-span-2"
          error={errors.contract_type?.message}
          description="Утилизация - для дальнейшего создания сопроводительных паспортов/ТТН. Перевозка - для вывоза отходов сторонней организацией (не нами и не контрагентом по договору с типом 'утилизация')"
        >
          <Select
            id="contract_type"
            disabled={pending}
            {...register("contract_type")}
          >
            {ContractTypeValues.map((value) => (
              <option key={value} value={value}>
                {CONTRACT_TYPE_LABEL[value]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor="counterparty_id"
          label="Контрагент"
          required
          className="md:col-span-2"
          error={errors.counterparty_id?.message}
          description={
            <>
              Нет в списке нужного?{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => setCounterpartyModalOpen(true)}
              >
                Создать контрагента
              </button>
              {" · "}
              <Link
                to="/directories/counterparties"
                search={tenantId ? { tenant: tenantId } : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Открыть справочник
              </Link>
            </>
          }
        >
          <Controller
            name="counterparty_id"
            control={control}
            render={({ field }) => (
              <CounterpartySelect
                tenantId={activeTenantId}
                value={field.value}
                disabled={pending}
                placeholder="Выберите активного контрагента"
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
        <FormField
          htmlFor="start_date"
          label="Дата заключения"
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
        <FormField
          htmlFor="number"
          label="Номер договора"
          required
          error={errors.number?.message}
        >
          <Input
            id="number"
            {...register("number")}
            placeholder="Д-001"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
          />
        </FormField>

        <FormField
          htmlFor="amount"
          label="Сумма вывоза отходов по договору"
          className="md:col-span-2"
          error={errors.amount?.message}
        >
          <Input
            id="amount"
            {...register("amount")}
            inputMode="decimal"
            placeholder="необязательно"
            disabled={pending}
            aria-invalid={Boolean(errors.amount)}
          />
        </FormField>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Перечень отходов
          </h2>
          <p className="text-sm text-muted-foreground">
            Допустим на обоих типах договора. Пустой перечень при сохранении
            очищает список (полная замена).
          </p>
        </div>
        <ContractWastesEditor
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
        <Button type="button" variant="secondary" disabled={pending}>
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

      {mode === "edit" && contractId ? (
        <ContractNextStepCta
          contractId={contractId}
          contractType={contractType}
          status={status}
          wasteCount={wastes.filter((item) => item.waste_id).length}
        />
      ) : null}

      <CounterpartyFormModal
        open={counterpartyModalOpen}
        mode="create"
        onOpenChange={setCounterpartyModalOpen}
        onSaved={(created) => {
          setValue("counterparty_id", created.id, { shouldValidate: true });
          setCounterpartyModalOpen(false);
        }}
      />
    </form>
  );
}
