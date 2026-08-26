import {
  INSTRUCTION_STATUS_LABEL,
  InstructionStatusValues,
  type Instruction,
} from "../../../../entities/waste/instructions";
import {
  Alert,
  AlertDescription,
  Button,
  FormField,
  Input,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { useUpsertInstructionForm } from "../model/use-upsert-instruction-form";
import { InstructionFormHint } from "./InstructionFormHint";
import { InstructionNextStepCta } from "./InstructionNextStepCta";

type InstructionFormProps = {
  mode: "create" | "edit";
  instructionId?: string;
  initial?: Instruction | null;
  onSaved: (instruction: Instruction, meta: { close: boolean }) => void;
  onCancel: () => void;
};

export function InstructionForm({
  mode,
  instructionId,
  initial,
  onSaved,
  onCancel,
}: InstructionFormProps) {
  const { form, error, pending, onSubmit } = useUpsertInstructionForm({
    mode,
    instructionId,
    initial,
    onSaved,
  });

  const {
    register,
    watch,
    formState: { errors },
  } = form;

  const status = watch("status");
  const datesRequired = status === "active";

  return (
    <form
      className="mx-auto max-w-4xl space-y-6"
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
    >
      <PageContextBar
        eyebrow="Справочники / Инструкции"
        title={mode === "create" ? "Новая инструкция" : "Инструкция"}
        description={
          mode === "create"
            ? "По умолчанию документ действует. Укажите название и период."
            : "Статус меняется в форме. Сохранение записывает выбранное значение."
        }
      />

      <InstructionFormHint mode={mode} status={status} />

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <FormField
          htmlFor="name"
          label="Название"
          required
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Например: Инструкция по обращению с отходами"
            {...register("name")}
          />
        </FormField>

        <FormField
          htmlFor="status"
          label="Статус"
          required
          error={errors.status?.message}
        >
          <Select id="status" disabled={pending} {...register("status")}>
            {InstructionStatusValues.map((value) => (
              <option key={value} value={value}>
                {INSTRUCTION_STATUS_LABEL[value]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          htmlFor="short_name"
          label="Короткое название"
          className="md:col-span-2"
          error={errors.short_name?.message}
        >
          <Input
            id="short_name"
            placeholder="Например: ИООС-1"
            {...register("short_name")}
          />
        </FormField>

        <FormField
          htmlFor="start_date"
          label="Дата начала"
          required={datesRequired}
          error={errors.start_date?.message}
          description="Обязательна для статуса «Действует»."
        >
          <Input id="start_date" type="date" {...register("start_date")} />
        </FormField>

        <FormField
          htmlFor="end_date"
          label="Дата окончания"
          required={datesRequired}
          error={errors.end_date?.message}
          description="Обязательна для статуса «Действует»."
        >
          <Input id="end_date" type="date" {...register("end_date")} />
        </FormField>
      </div>

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
          {mode === "create" ? "Создать и закрыть" : "Сохранить и закрыть"}
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

      {mode === "edit" && status === "active" ? (
        <InstructionNextStepCta />
      ) : null}
    </form>
  );
}
