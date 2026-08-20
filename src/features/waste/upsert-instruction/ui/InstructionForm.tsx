import type { Instruction } from "../../../../entities/waste/instructions";
import { InstructionStatusBadge } from "../../../../entities/waste/instructions";
import {
  Alert,
  AlertDescription,
  Button,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  PageContextBar,
} from "../../../../shared/ui";
import { instructionActivateSchema } from "../model/instruction-form.schema";
import type {
  InstructionSaveNext,
  InstructionWriteIntent,
} from "../model/instruction-save";
import { useUpsertInstructionForm } from "../model/use-upsert-instruction-form";
import { InstructionFormHint } from "./InstructionFormHint";

type InstructionFormProps = {
  mode: "create" | "edit";
  instructionId?: string;
  initial?: Instruction | null;
  onSaved: (
    instruction: Instruction,
    meta: { next: InstructionSaveNext; intent: InstructionWriteIntent },
  ) => void;
  onCancel: () => void;
};

function applyActivateErrors(
  setError: ReturnType<typeof useUpsertInstructionForm>["form"]["setError"],
  issues: { path: PropertyKey[]; message: string }[],
) {
  for (const issue of issues) {
    const key = issue.path[0];
    if (key === "start_date" || key === "end_date" || key === "name") {
      setError(key, { type: "manual", message: issue.message });
    }
  }
}

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
    setError,
    formState: { errors },
  } = form;

  const status = initial?.status ?? "draft";
  const canActivate = status !== "active";
  const canDeactivate = mode === "edit" && status === "active";

  const submit = (
    next: InstructionSaveNext,
    intent: InstructionWriteIntent,
  ) => {
    if (intent === "deactivate") {
      onSubmit(next, form.getValues(), intent);
      return;
    }

    void form.handleSubmit((values) => {
      if (intent === "activate") {
        const parsed = instructionActivateSchema.safeParse(values);
        if (!parsed.success) {
          applyActivateErrors(setError, parsed.error.issues);
          return;
        }
      }
      onSubmit(next, values, intent);
    })();
  };

  const saveNext: InstructionSaveNext = mode === "create" ? "open" : "stay";

  return (
    <form
      className="mx-auto max-w-4xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit(saveNext, "save");
      }}
    >
      <PageContextBar
        eyebrow="Справочники / Инструкции"
        title={mode === "create" ? "Новая инструкция" : "Инструкция"}
        description={
          mode === "create"
            ? "Достаточно названия. Дальше система подскажет, как ввести документ в действие."
            : "Сохранение не меняет статус. Ввести в действие или снять — отдельными кнопками."
        }
        actions={
          mode === "edit" ? <InstructionStatusBadge status={status} /> : null
        }
      />
      <div className="grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        {error ? (
          <Alert variant="error" className="md:col-span-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <InstructionFormHint mode={mode} status={status} />

        <div className="grid gap-1.5">
          <FieldLabel htmlFor="name" required>
            Название
          </FieldLabel>
          <Input
            id="name"
            placeholder="Например: Инструкция по обращению с отходами"
            {...register("name")}
          />
          <FieldError>{errors.name?.message}</FieldError>
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
          <FieldDescription>
            Нужна, чтобы ввести инструкцию в действие.
          </FieldDescription>
          <FieldError>{errors.start_date?.message}</FieldError>
        </div>
        <div className="grid gap-1.5">
          <FieldLabel htmlFor="end_date">Дата окончания</FieldLabel>
          <Input id="end_date" type="date" {...register("end_date")} />
          <FieldDescription>
            Нужна, чтобы ввести инструкцию в действие.
          </FieldDescription>
          <FieldError>{errors.end_date?.message}</FieldError>
        </div>

        <div className="flex flex-wrap gap-2 pt-1 md:col-span-2">
          <Button
            type="submit"
            variant={mode === "edit" && canActivate ? "secondary" : "default"}
            disabled={pending}
          >
            {pending
              ? "Сохранение…"
              : mode === "create"
                ? "Создать"
                : "Сохранить"}
          </Button>
          {mode === "edit" && canActivate ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() => submit("stay", "activate")}
            >
              Ввести в действие
            </Button>
          ) : null}
          {canDeactivate ? (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => submit("stay", "deactivate")}
            >
              Снять с действия
            </Button>
          ) : null}
          {mode === "edit" ? (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => submit("list", "save")}
            >
              Сохранить и закрыть
            </Button>
          ) : null}
          <Button
            type="button"
            disabled={pending}
            variant="outline"
            onClick={onCancel}
          >
            Отмена
          </Button>
        </div>
      </div>
    </form>
  );
}
