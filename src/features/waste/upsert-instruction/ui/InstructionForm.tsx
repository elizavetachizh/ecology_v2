import {
  INSTRUCTION_STATUS_LABEL,
  InstructionStatusValues,
  type Instruction,
} from "../../../../entities/waste/instructions";
import {
  Alert,
  AlertDescription,
  Button,
  FieldLabel,
  Input,
  PageContextBar,
  Select,
} from "../../../../shared/ui";
import { useUpsertInstructionForm } from "../model/use-upsert-instruction-form";

type InstructionFormProps = {
  mode: "create" | "edit";
  instructionId?: string;
  initial?: Instruction | null;
  onSaved: (instruction: Instruction, meta: { close: boolean }) => void;
  onCancel: () => void;
  showNextStepCta?: boolean;
};

export function InstructionForm({
  mode,
  instructionId,
  initial,
  onSaved,
  onCancel,
  showNextStepCta: _showNextStepCta,
}: InstructionFormProps) {
  const { form, error, pending, onSubmit, successMessage } =
    useUpsertInstructionForm({
      mode,
      instructionId,
      initial,
      onSaved,
    });

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <form
      className="mx-auto max-w-4xl space-y-6"
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
    >
      {successMessage && (
        <Alert variant="success">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <PageContextBar
        eyebrow="Справочники / Инструкции"
        title={mode === "create" ? "Новая инструкция" : "Инструкция"}
        description="После сохранения инструкция становится активной и может быть использована для создания отходов."
      />
      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="name">Название</FieldLabel>
          <Input
            id="name"
            placeholder="Например: Инструкция по утилизации отходов"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-xs text-destructive">
              {errors.name.message}
            </span>
          )}
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="short_name">Короткое название</FieldLabel>
          <Input
            id="short_name"
            placeholder="Например: ИООС-1"
            {...register("short_name")}
          />
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="start_date">Дата начала</FieldLabel>
          <Input id="start_date" type="date" {...register("start_date")} />
          {errors.start_date && (
            <span className="text-xs text-destructive">
              {errors.start_date.message}
            </span>
          )}
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="end_date">Дата окончания</FieldLabel>
          <Input id="end_date" type="date" {...register("end_date")} />
          {errors.end_date && (
            <span className="text-xs text-destructive">
              {errors.end_date.message}
            </span>
          )}
        </div>

        <div>
          <FieldLabel htmlFor="status">Статус</FieldLabel>{" "}
          <Select id="status" {...register("status")}>
            {InstructionStatusValues.map((status) => (
              <option key={status} value={status}>
                {INSTRUCTION_STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
          {errors.status && (
            <span className="text-xs text-destructive">
              {errors.status.message}
            </span>
          )}
        </div>
        {error && <Alert variant="error">...</Alert>}
        <div className="flex flex-wrap gap-2 pt-1 md:col-span-2">
          <Button type="submit" disabled={pending}>
            Сохранить
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </div>
    </form>
  );
}
