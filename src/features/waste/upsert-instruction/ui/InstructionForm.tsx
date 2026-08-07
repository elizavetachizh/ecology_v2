import {
  INSTRUCTION_STATUS_LABEL,
  InstructionStatusValues,
  type Instruction,
} from "../../../../entities/waste/instructions";
import {
  Alert,
  Button,
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
  showNextStepCta,
}: InstructionFormProps) {
  const { form, error, pending, onSubmit } = useUpsertInstructionForm({
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
      <PageContextBar
        eyebrow="Справочники / Инструкции"
        title={mode === "create" ? "Новая инструкция" : "Инструкция"}
        description="После сохранения инструкция становится активной и может быть использована для создания отходов."
      />
      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <Input {...register("name")} />
        {errors.name && <span>{errors.name.message}</span>}

        <Input {...register("short_name")} />
        <Input type="date" {...register("start_date")} />
        <Input type="date" {...register("end_date")} />
        <Select {...register("status")}>
          {InstructionStatusValues.map((status) => (
            <option key={status} value={status}>
              {INSTRUCTION_STATUS_LABEL[status]}
            </option>
          ))}
        </Select>

        {error && <Alert variant="error">...</Alert>}

        <Button type="submit" disabled={pending}>
          Сохранить
        </Button>
        <Button
          type="button"
          disabled={pending}
          onClick={() =>
            void form.handleSubmit((values) => onSubmit(true, values))()
          }
        >
          Сохранить и закрыть
        </Button>
        <Button type="button" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
