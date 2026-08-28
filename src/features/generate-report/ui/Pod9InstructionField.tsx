import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import {
  InstructionStatusBadge,
  InstructionTabLabel,
  type InstructionBrief,
} from "../../../entities/waste/instructions";
import { cn } from "../../../shared/lib/cn";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../shared/ui";

type Pod9InstructionFieldProps = {
  unitId: string;
  instructions: InstructionBrief[];
  loading: boolean;
  error: Error | null;
  value: string;
  onChange: (instructionId: string) => void;
  disabled?: boolean;
  errorMessage?: string;
};

export function Pod9InstructionField({
  unitId,
  instructions,
  loading,
  error,
  value,
  onChange,
  disabled = false,
  errorMessage,
}: Pod9InstructionFieldProps) {
  const selected = instructions.find((item) => item.id === value);
  const canSwitch = instructions.length > 1;
  const [expanded, setExpanded] = useState(false);

  if (!unitId) {
    return (
      <Field className="md:col-span-2">
        <FieldLabel htmlFor="pod9-instruction" required>
          Инструкция
        </FieldLabel>
        <p
          id="pod9-instruction"
          className="text-sm text-muted-foreground"
        >
          Сначала выберите место учёта.
        </p>
        <FieldError>{errorMessage}</FieldError>
      </Field>
    );
  }

  if (loading) {
    return (
      <Field className="md:col-span-2">
        <FieldLabel htmlFor="pod9-instruction" required>
          Инструкция
        </FieldLabel>
        <p className="text-sm text-muted-foreground">Загрузка инструкций…</p>
      </Field>
    );
  }

  if (error) {
    return (
      <Alert variant="error" className="md:col-span-2">
        <AlertTitle>Не удалось загрузить инструкции</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (instructions.length === 0) {
    return (
      <Alert variant="info" className="md:col-span-2">
        <AlertTitle>Нет инструкций на этом месте учёта</AlertTitle>
        <AlertDescription>
          Сначала привяжите отходы к инструкции на карточке места учёта.{" "}
          <Link
            to="/directories/units/$unitId"
            params={{ unitId }}
            search={{ instructionId: undefined }}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Открыть место учёта
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Field className="md:col-span-2">
      <FieldLabel htmlFor="pod9-instruction" required>
        Инструкция
      </FieldLabel>
      {selected && !expanded ? (
        <div
          id="pod9-instruction"
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
        >
          <InstructionTabLabel
            instruction={selected}
            className="min-w-0 flex-1"
          />
          <InstructionStatusBadge status={selected.status} />
          {canSwitch ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => setExpanded(true)}
            >
              Другая
              <ChevronDown />
            </Button>
          ) : null}
        </div>
      ) : (
        <div
          id="pod9-instruction"
          role="radiogroup"
          aria-label="Инструкция"
          className="grid gap-1.5"
        >
          {instructions.map((item) => {
            const checked = item.id === value;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => {
                  onChange(item.id);
                  setExpanded(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent",
                  disabled && "opacity-50",
                )}
              >
                <InstructionTabLabel
                  instruction={item}
                  className="min-w-0 flex-1"
                />
                <InstructionStatusBadge status={item.status} />
              </button>
            );
          })}
        </div>
      )}
      {!selected && instructions.length > 0 ? (
        <FieldDescription>
          Нет действующей инструкции — выберите из списка.
        </FieldDescription>
      ) : (
        <FieldDescription>
          Листы Excel соответствуют отходам привязки этой инструкции к месту
          учёта.
        </FieldDescription>
      )}
      <FieldError>{errorMessage}</FieldError>
    </Field>
  );
}
