import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  contractsQueryKeys,
  getContract,
} from "../../../../entities/waste/contracts";
import {
  PASSPORT_STATUS_LABEL,
  PASSPORT_TRANSPORT_TYPE_LABEL,
  PassportStatusValues,
  PassportTransportTypeValues,
  type Passport,
} from "../../../../entities/waste/passports";
import { useTenant } from "../../../../entities/tenant";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { syncPassportWastes } from "../model/keep-wastes-allowed";
import { useUpsertPassportForm } from "../model/use-upsert-passport-form";
import { PassportContractSelect } from "./PassportContractSelect";
import { PassportCounterpartySelect } from "./PassportCounterpartySelect";
import { PassportUnitSelect } from "./PassportUnitSelect";
import { PassportWastesSelect } from "./PassportWastesSelect";

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
      onSubmit={form.handleSubmit((values) =>
        onSubmit({ ...values, waste_ids: kept }),
      )}
      className="mx-auto max-w-4xl space-y-6"
    >
      <PageContextBar
        eyebrow="Отходы / Сопроводительные паспорта"
        title={
          mode === "create"
            ? "Новый сопроводительный паспорт"
            : `Паспорт ${initial?.number ?? ""}`
        }
      />

      <Alert variant="info">
        <AlertTitle>Договор утилизации</AlertTitle>
        <AlertDescription>
          Выберите договор утилизации — список отходов паспорта ограничен его
          перечнем. Договор перевозки нужен только если выбран способ «по
          договору перевозки».
        </AlertDescription>
      </Alert>

      {error ? (
        <Alert variant="error">
          <AlertTitle>Не удалось сохранить</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <section className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <h2 className="text-sm font-semibold text-foreground md:col-span-2">
          Реквизиты
        </h2>
        <Field>
          <FieldLabel htmlFor="number" required>
            Регистрационный номер СП
          </FieldLabel>
          <Input
            id="number"
            {...register("number")}
            placeholder="СП-001"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
          />
          <FieldError>{errors.number?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="date" required>
            Дата вывоза
          </FieldLabel>
          <Input
            id="date"
            type="date"
            {...register("date")}
            disabled={pending}
            aria-invalid={Boolean(errors.date)}
          />
          <FieldError>{errors.date?.message}</FieldError>
        </Field>
        <Field className="md:col-span-2">
          <FieldLabel htmlFor="unit_id" required>
            Структурная единица
          </FieldLabel>
          <Controller
            name="unit_id"
            control={control}
            render={({ field }) => (
              <PassportUnitSelect
                tenantId={activeTenantId}
                value={field.value}
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
          <FieldError>{errors.unit_id?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="status" required>
            Статус
          </FieldLabel>
          <Select id="status" disabled={pending} {...register("status")}>
            {PassportStatusValues.map((value) => (
              <option key={value} value={value}>
                {PASSPORT_STATUS_LABEL[value]}
              </option>
            ))}
          </Select>
        </Field>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Договор утилизации и отходы
        </h2>
        <Field>
          <FieldLabel htmlFor="recycling_contract_id" required>
            Договор утилизации
          </FieldLabel>
          <Controller
            name="recycling_contract_id"
            control={control}
            render={({ field }) => (
              <PassportContractSelect
                tenantId={activeTenantId}
                value={field.value}
                contractType="recycling"
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            Только действующие договоры типа «Утилизация». Нет договора?{" "}
            <Link
              to="/directories/contracts/new"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Создать в справочнике
            </Link>
          </FieldDescription>
          <FieldError>{errors.recycling_contract_id?.message}</FieldError>
        </Field>

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
          <FieldLabel htmlFor="transport_type" required>
            Способ перевозки
          </FieldLabel>
          <Select
            id="transport_type"
            disabled={pending}
            {...register("transport_type", {
              onChange: (event) => {
                if (event.target.value !== "transport_contract") {
                  setValue("transport_contract_id", "");
                }
              },
            })}
          >
            {PassportTransportTypeValues.map((value) => (
              <option key={value} value={value}>
                {PASSPORT_TRANSPORT_TYPE_LABEL[value]}
              </option>
            ))}
          </Select>
          <FieldDescription>
            «Самостоятельно» и «по договору утилизации» не требуют договора
            перевозки — поле скрыто.
          </FieldDescription>
        </Field>
        {transportType === "transport_contract" ? (
          <Field>
            <FieldLabel htmlFor="transport_contract_id" required>
              Договор перевозки
            </FieldLabel>
            <Controller
              name="transport_contract_id"
              control={control}
              render={({ field }) => (
                <PassportContractSelect
                  tenantId={activeTenantId}
                  value={field.value}
                  contractType="transport"
                  disabled={pending}
                  onChange={field.onChange}
                />
              )}
            />
            <FieldDescription>
              Нужен только если выбран способ «по договору перевозки».
            </FieldDescription>
            <FieldError>{errors.transport_contract_id?.message}</FieldError>
          </Field>
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
          <FieldLabel htmlFor="waste_producer_id">
            Контрагент-производитель
          </FieldLabel>
          <Controller
            name="waste_producer_id"
            control={control}
            render={({ field }) => (
              <PassportCounterpartySelect
                tenantId={activeTenantId}
                value={field.value}
                disabled={pending}
                onChange={field.onChange}
              />
            )}
          />
          <FieldDescription>
            Необязательно. Выбирается, в случае если производителем отхода
            является контрагент.
          </FieldDescription>
          <FieldError>{errors.waste_producer_id?.message}</FieldError>
        </Field>
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
          Отмена
        </Button>
      </div>
    </form>
  );
}
