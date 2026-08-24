import { useState } from "react";
import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  CONTRACT_STATUS_LABEL,
  CONTRACT_TYPE_LABEL,
  ContractStatusValues,
  ContractTypeValues,
  type Contract,
} from "../../../../entities/waste/contracts";
import { useTenant } from "../../../../entities/tenant";
import { CounterpartyFormModal } from "../../upsert-counterparty";
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { useUpsertContractForm } from "../model/use-upsert-contract-form";
import { ContractCounterpartySelect } from "./ContractCounterpartySelect";
import { ContractFormHint } from "./ContractFormHint";
import { ContractNextStepCta } from "./ContractNextStepCta";
import { ContractWastesEditor } from "./ContractWastesEditor";

type ContractFormProps = {
  mode: "create" | "edit";
  contractId?: string;
  initial?: Contract | null;
  onSaved: (contract: Contract) => void;
  onCancel: () => void;
};

export function ContractForm({
  mode,
  contractId,
  initial,
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
      />

      <ContractFormHint contractType={contractType} />

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid items-start gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="contract_type" required>
            Тип договора
          </FieldLabel>
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
          <FieldDescription>
            Зафиксируйте тип сразу: от него зависят подписи и селекты в
            сопроводительном паспорте.
          </FieldDescription>
          <FieldError>{errors.contract_type?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="status" required>
            Статус
          </FieldLabel>
          <Select id="status" disabled={pending} {...register("status")}>
            {ContractStatusValues.map((value) => (
              <option key={value} value={value}>
                {CONTRACT_STATUS_LABEL[value]}
              </option>
            ))}
          </Select>
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="counterparty_id" required>
            Контрагент
          </FieldLabel>
          <Controller
            name="counterparty_id"
            control={control}
            render={({ field }) => (
              <ContractCounterpartySelect
                tenantId={activeTenantId}
                value={field.value}
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            В селекте только активные. Нет в списке?{" "}
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
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Открыть справочник
            </Link>
          </FieldDescription>
          <FieldError>{errors.counterparty_id?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="number" required>
            Номер
          </FieldLabel>
          <Input
            id="number"
            {...register("number")}
            placeholder="Д-001"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
          />
          <FieldError>{errors.number?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="amount">Сумма / лимит</FieldLabel>
          <Input
            id="amount"
            {...register("amount")}
            inputMode="decimal"
            placeholder="необязательно"
            disabled={pending}
            aria-invalid={Boolean(errors.amount)}
          />
          <FieldError>{errors.amount?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="start_date" required>
            Дата заключения
          </FieldLabel>
          <Input
            id="start_date"
            type="date"
            {...register("start_date")}
            disabled={pending}
            aria-invalid={Boolean(errors.start_date)}
          />
          <FieldError>{errors.start_date?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="end_date">Дата окончания</FieldLabel>
          <Input
            id="end_date"
            type="date"
            {...register("end_date")}
            disabled={pending}
            aria-invalid={Boolean(errors.end_date)}
          />
          <FieldError>{errors.end_date?.message}</FieldError>
        </Field>
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
              ? "Создать договор"
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

      {mode === "edit" && contractId ? (
        <ContractNextStepCta
          contractId={contractId}
          contractType={contractType}
          status={status}
          wasteCount={wastes.length}
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
