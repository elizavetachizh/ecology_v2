import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ContractSelect,
  contractsQueryKeys,
  getContract,
} from "../../../../entities/waste/contracts";
import { CounterpartySelect } from "../../../../entities/waste/counterparties";
import {
  PASSPORT_TRANSPORT_TYPE_LABEL,
  PassportStatusBadge,
  PassportTransportTypeValues,
  type Passport,
} from "../../../../entities/waste/passports";
import { useTenant } from "../../../../entities/tenant";
import { UnitSelect } from "../../../../entities/waste/units";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DirectoryBreadcrumb,
  Field,
  FormField,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import {
  PASSPORT_WASTE_PRODUCER_TYPE_LABEL,
  PassportWasteProducerTypeValues,
} from "../model/passport-form.schema";
import { syncPassportWastes } from "../model/keep-wastes-allowed";
import { useUpsertPassportForm } from "../model/use-upsert-passport-form";
import { PassportWastesSelect } from "./PassportWastesSelect";
import { routes } from "../../../../shared/config/routes";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_RE.test(value);
}

type PassportFormProps = {
  mode: "create" | "edit";
  passportId?: string;
  initial?: Passport | null;
  defaultRecyclingContractId?: string;
  onSaved: (passport: Passport) => void;
  onCancel: () => void;
};

export function PassportForm({
  mode,
  passportId,
  initial,
  defaultRecyclingContractId,
  onSaved,
  onCancel,
}: PassportFormProps) {
  const { activeTenantId } = useTenant();
  const { form, error, pending, onSubmit } = useUpsertPassportForm({
    mode,
    passportId,
    initial,
    defaultRecyclingContractId,
    onSaved,
  });
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const recyclingContractId = watch("recycling_contract_id");
  const transportType = watch("transport_type");
  const wasteProducerType = watch("waste_producer_type");
  const wasteIds = watch("waste_ids");

  const recyclingQuery = useQuery({
    queryKey: contractsQueryKeys.detail(
      activeTenantId ?? "none",
      recyclingContractId || "none",
    ),
    queryFn: ({ signal }) => getContract(recyclingContractId, signal),
    enabled: Boolean(activeTenantId && isUuid(recyclingContractId)),
  });

  const recyclingWastes = recyclingQuery.data?.wastes ?? [];
  const { kept, conflict: wasteConflict } = syncPassportWastes(
    wasteIds,
    recyclingQuery.data ? recyclingWastes.map((item) => item.waste_id) : null,
  );

  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        if (kept.length < 1) {
          setValue("waste_ids", [], { shouldValidate: true });
          return;
        }
        onSubmit({ ...values, waste_ids: kept });
      })}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow={
          <DirectoryBreadcrumb
            directoryLabel="Сопроводительные паспорта"
            directoryTo={routes.waste.passports.list}
            current={
              mode === "create"
                ? "Новый сопроводительный паспорт"
                : `Паспорт ${initial?.number ?? ""}`
            }
          />
        }
        title={
          mode === "create"
            ? "Новый сопроводительный паспорт"
            : `Паспорт ${initial?.number ?? ""}`
        }
        actions={<PassportStatusBadge status={initial?.status ?? "active"} />}
      />

      {error ? (
        <Alert variant="error">
          <AlertTitle>Не удалось сохранить</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid items-start gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <h2 className="text-sm font-semibold text-foreground md:col-span-2">
          Реквизиты
        </h2>
        <FormField
          htmlFor="number"
          label="Регистрационный номер СП"
          required
          error={errors.number?.message}
        >
          <Input
            id="number"
            {...register("number")}
            placeholder="СП-001"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
          />
        </FormField>
        <FormField
          htmlFor="date"
          label="Дата вывоза"
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
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Договор утилизации и отходы
        </h2>
        <FormField
          htmlFor="recycling_contract_id"
          label="Договор утилизации"
          required
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

        {wasteConflict ? (
          <Alert variant="warning">
            <AlertTitle>Перечень изменился</AlertTitle>
            <AlertDescription>
              Текущие отходы не входят в новый договор — они сняты. Выберите
              отходы из перечня выбранного договора.
            </AlertDescription>
          </Alert>
        ) : null}

        <PassportWastesSelect
          wastes={recyclingWastes}
          value={kept}
          loading={recyclingQuery.isLoading}
          recyclingContractId={recyclingContractId}
          contractLoaded={Boolean(recyclingQuery.data)}
          pending={pending}
          error={errors.waste_ids?.message}
          conflict={wasteConflict}
          onChange={(ids) =>
            setValue("waste_ids", ids, { shouldValidate: true })
          }
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Перевозчик отхода
        </h2>
        <Field>
          <p
            id="transport-type-label"
            className="text-sm font-medium leading-none text-foreground"
          >
            Способ перевозки
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          </p>
          <div
            role="radiogroup"
            aria-labelledby="transport-type-label"
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {PassportTransportTypeValues.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  value={value}
                  disabled={pending}
                  className="size-4 accent-primary disabled:cursor-not-allowed"
                  {...register("transport_type", {
                    onChange: (event) => {
                      if (event.target.value !== "transport_contract") {
                        setValue("transport_contract_id", "");
                      }
                    },
                  })}
                />
                {PASSPORT_TRANSPORT_TYPE_LABEL[value]}
              </label>
            ))}
          </div>
        </Field>
        {transportType === "transport_contract" ? (
          <FormField
            htmlFor="transport_contract_id"
            label="Договор перевозки"
            required
            error={errors.transport_contract_id?.message}
            description={
              <>
                Нет в списке нужного?{" "}
                <Link
                  to={routes.directories.contracts.new}
                  search={
                    activeTenantId
                      ? { tenant: activeTenantId, contract_type: "transport" }
                      : undefined
                  }
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
              name="transport_contract_id"
              control={control}
              render={({ field }) => (
                <ContractSelect
                  tenantId={activeTenantId}
                  value={field.value}
                  contractType="transport"
                  disabled={pending}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>
        ) : (
          <p className="text-sm text-muted-foreground">
            {transportType === "recycling_contract"
              ? "Перевозка идёт по договору утилизации."
              : "Организация вывозит отходы самостоятельно."}
          </p>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Производитель отходов
        </h2>
        <Field>
          <p
            id="waste-producer-type-label"
            className="text-sm font-medium leading-none text-foreground"
          >
            Производитель
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          </p>
          <div
            role="radiogroup"
            aria-labelledby="waste-producer-type-label"
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {PassportWasteProducerTypeValues.map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
              >
                <input
                  type="radio"
                  value={value}
                  disabled={pending}
                  className="size-4 accent-primary disabled:cursor-not-allowed"
                  {...register("waste_producer_type", {
                    onChange: (event) => {
                      if (event.target.value !== "counterparty") {
                        setValue("waste_producer_id", "");
                      }
                    },
                  })}
                />
                {PASSPORT_WASTE_PRODUCER_TYPE_LABEL[value]}
              </label>
            ))}
          </div>
        </Field>
        {wasteProducerType === "counterparty" ? (
          <FormField
            htmlFor="waste_producer_id"
            label="Контрагент"
            required
            error={errors.waste_producer_id?.message}
            description={
              <>
                Нет в списке нужного?{" "}
                <Link
                  to={routes.directories.counterparties.new}
                  search={
                    activeTenantId ? { tenant: activeTenantId } : undefined
                  }
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
              name="waste_producer_id"
              control={control}
              render={({ field }) => (
                <CounterpartySelect
                  tenantId={activeTenantId}
                  value={field.value}
                  disabled={pending}
                  placeholder="Выберите контрагента"
                  aria-label="Контрагент-производитель"
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>
        ) : (
          <p className="text-sm text-muted-foreground">
            Производитель — сама организация.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать паспорт"
              : "Сохранить"}
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
