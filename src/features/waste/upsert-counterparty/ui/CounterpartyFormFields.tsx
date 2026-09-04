import { Controller, type UseFormReturn } from "react-hook-form";
import {
  Alert,
  AlertDescription,
  Field,
  FieldDescription,
  FieldLabel,
  FormField,
  Input,
  Switch,
} from "../../../../shared/ui";
import {
  sanitizeUnpInput,
  type CounterpartyFormValues,
} from "../model/counterparty-form.schema";

type CounterpartyFormFieldsProps = {
  form: UseFormReturn<CounterpartyFormValues>;
  pending: boolean;
  error: string | null;
};

export function CounterpartyFormFields({
  form,
  pending,
  error,
}: CounterpartyFormFieldsProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <div className="grid gap-3 py-2">
      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FormField
        htmlFor="name"
        label="Наименование"
        required
        error={errors.name?.message}
      >
        <Input
          id="name"
          {...register("name")}
          placeholder="Ромашка"
          autoFocus
          disabled={pending}
          aria-invalid={Boolean(errors.name)}
        />
      </FormField>

      <FormField
        htmlFor="full_name"
        label="Полное наименование"
        error={errors.full_name?.message}
      >
        <Input
          id="full_name"
          {...register("full_name")}
          placeholder="ООО «Ромашка»"
          disabled={pending}
          aria-invalid={Boolean(errors.full_name)}
        />
      </FormField>

      <FormField
        htmlFor="unp"
        label="УНП"
        error={errors.unp?.message}
        description="УНП — ровно 9 цифр. Можно не указывать."
      >
        <Controller
          name="unp"
          control={control}
          render={({ field }) => (
            <Input
              id="unp"
              name={field.name}
              ref={field.ref}
              inputMode="numeric"
              autoComplete="off"
              maxLength={9}
              placeholder="091234567"
              disabled={pending}
              aria-invalid={Boolean(errors.unp)}
              value={field.value}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(sanitizeUnpInput(event.target.value))
              }
            />
          )}
        />
      </FormField>

      <FormField
        htmlFor="address"
        label="Адрес"
        error={errors.address?.message}
      >
        <Input
          id="address"
          {...register("address")}
          placeholder="г. Минск, ул. Ленина, 1"
          disabled={pending}
          aria-invalid={Boolean(errors.address)}
        />
      </FormField>

      <FormField
        htmlFor="contact"
        label="Контакты"
        error={errors.contact?.message}
      >
        <Input
          id="contact"
          {...register("contact")}
          placeholder="+375 17 000-00-00"
          disabled={pending}
          aria-invalid={Boolean(errors.contact)}
        />
      </FormField>

      <Field>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <FieldLabel htmlFor="is_individual">Физлицо</FieldLabel>
            <FieldDescription>
              Включите, если контрагент — физическое лицо.
            </FieldDescription>
          </div>
          <Controller
            name="is_individual"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_individual"
                checked={field.value}
                disabled={pending}
                onCheckedChange={field.onChange}
                aria-label="Физлицо"
              />
            )}
          />
        </div>
      </Field>

      <Field>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <FieldLabel htmlFor="is_active">Активен</FieldLabel>
            <FieldDescription>
              Неактивные скрыты в селектах договоров и сопроводительных по
              умолчанию.
            </FieldDescription>
          </div>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_active"
                checked={field.value}
                disabled={pending}
                onCheckedChange={field.onChange}
                aria-label="Активен"
              />
            )}
          />
        </div>
      </Field>
    </div>
  );
}
