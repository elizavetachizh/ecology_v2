import { useState } from "react";
import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  CONTRACT_TYPE_LABEL,
  ContractStatusBadge,
  ContractTypeValues,
  type Contract,
  type ContractType,
} from "../../../../entities/waste/contracts";
import { useTenant } from "../../../../entities/tenant";
import { CounterpartySelect } from "../../../../entities/waste/counterparties";
import { CounterpartyFormModal } from "../../upsert-counterparty";
import { applyCounterpartySnapshot } from "../model/counterparty-snapshot";
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
import { useUpsertContractForm } from "../model/use-upsert-contract-form";
import { applyContractTypeChange } from "../model/apply-contract-form-rules";
import { usePrefillCounterparty } from "../model/use-prefill-counterparty";
import { ContractNextStepCta } from "./ContractNextStepCta";
import { ContractRecyclingFields } from "./ContractRecyclingFields";
import { ContractWastesEditor } from "./ContractWastesEditor";
import { routes } from "../../../../shared/config/routes";

type ContractFormProps = {
  mode: "create" | "edit";
  contractId?: string;
  initial?: Contract | null;
  defaultCounterpartyId?: string;
  defaultContractType?: ContractType;
  onSaved: (contract: Contract, meta: { close: boolean }) => void;
  onCancel: () => void;
};

export function ContractForm({
  mode,
  contractId,
  initial,
  defaultCounterpartyId,
  defaultContractType,
  onSaved,
  onCancel,
}: ContractFormProps) {
  const { activeTenantId } = useTenant();
  const [counterpartyModalOpen, setCounterpartyModalOpen] = useState(false);
  const { form, error, pending, onSubmit } = useUpsertContractForm({
    mode,
    contractId,
    initial,
    defaultCounterpartyId,
    defaultContractType,
    onSaved,
  });
  const {
    control,
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;
  const contractType = watch("contract_type");
  const status = watch("status");
  const wastes = watch("wastes");

  usePrefillCounterparty({
    enabled: mode === "create",
    counterpartyId: defaultCounterpartyId,
    tenantId: activeTenantId,
    getValues,
    setValue,
  });

  const title =
    mode === "create" ? "Новый договор" : `Договор ${initial?.number ?? ""}`;

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow={
          <DirectoryBreadcrumb
            directoryLabel="Договоры"
            directoryTo={routes.directories.contracts.list}
            current={title}
          />
        }
        title={title}
        actions={
          mode === "edit" &&
          initial && <ContractStatusBadge status={initial.status} />
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
          description={
            mode === "edit"
              ? "Утилизация — для паспортов и ТТН. Перевозка — если вывозит сторонняя организация. Смена типа будет отклонена, если на договор уже ссылается паспорт или ТТН."
              : "Утилизация - для дальнейшего создания сопроводительных паспортов/ТТН. Перевозка - для вывоза отходов сторонней организацией (не нами и не контрагентом по договору с типом 'утилизация')"
          }
        >
          <Select
            id="contract_type"
            disabled={pending}
            {...register("contract_type", {
              onChange: (event) => {
                applyContractTypeChange(setValue, event.target.value);
              },
            })}
          >
            {ContractTypeValues.map((value) => (
              <option key={value} value={value}>
                {CONTRACT_TYPE_LABEL[value]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          htmlFor="number"
          className="md:col-span-2"
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
                to={routes.directories.counterparties.list}
                search={activeTenantId ? { tenant: activeTenantId } : undefined}
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
                onChange={(id, item) => {
                  field.onChange(id);
                  applyCounterpartySnapshot(setValue, item ?? null);
                }}
              />
            )}
          />
        </FormField>
        <FormField
          htmlFor="counterparty_address"
          label="Адрес контрагента"
          error={errors.counterparty_address?.message}
          description="Подставляется из карточки контрагента, можно изменить."
        >
          <Input
            id="counterparty_address"
            {...register("counterparty_address")}
            placeholder="г. Минск, ул. Ленина, 1"
            disabled={pending}
            aria-invalid={Boolean(errors.counterparty_address)}
          />
        </FormField>
        <FormField
          htmlFor="counterparty_contact"
          label="Контакты контрагента"
          error={errors.counterparty_contact?.message}
          description="Подставляется из карточки контрагента, можно изменить."
        >
          <Input
            id="counterparty_contact"
            {...register("counterparty_contact")}
            placeholder="+375 17 ХХХ-ХХ-ХХ"
            disabled={pending}
            aria-invalid={Boolean(errors.counterparty_contact)}
          />
        </FormField>

        {contractType === "recycling" ? (
          <ContractRecyclingFields form={form} pending={pending} />
        ) : null}
      </div>
      {contractType === "recycling" ? (
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">
              Перечень отходов
            </h2>
            <p className="text-sm text-muted-foreground">
              Обязательно для договора утилизации. Для перевозки не указывается.
            </p>
          </div>
          <ContractWastesEditor
            form={form}
            tenantId={activeTenantId}
            pending={pending}
          />
        </section>
      ) : null}

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
          applyCounterpartySnapshot(setValue, created);
          setCounterpartyModalOpen(false);
        }}
      />
    </form>
  );
}
