import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  TTN_STATUS_LABEL,
  TtnStatusValues,
  type Ttn,
} from "../../../../entities/waste/ttns";
import { useTenant } from "../../../../entities/tenant";
import {
  PassportContractSelect,
  PassportUnitSelect,
} from "../../upsert-passport";
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
import { useUpsertTtnForm } from "../model/use-upsert-ttn-form";

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
        <Field>
          <FieldLabel htmlFor="number" required>
            Номер
          </FieldLabel>
          <Input
            id="number"
            {...register("number")}
            placeholder="ТТН-001"
            disabled={pending}
            aria-invalid={Boolean(errors.number)}
          />
          <FieldError>{errors.number?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="date" required>
            Дата перевозки
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
        <Field className="md:col-span-2">
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
        <Field>
          <FieldLabel htmlFor="status" required>
            Статус
          </FieldLabel>
          <Select id="status" disabled={pending} {...register("status")}>
            {TtnStatusValues.map((value) => (
              <option key={value} value={value}>
                {TTN_STATUS_LABEL[value]}
              </option>
            ))}
          </Select>
        </Field>
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
