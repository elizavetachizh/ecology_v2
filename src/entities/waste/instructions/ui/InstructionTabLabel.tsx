import { cn } from "../../../../shared/lib/cn";
import {
  INSTRUCTION_STATUS_LABEL,
  type Instruction,
  type InstructionStatus,
} from "../model/instructions.types";

const STATUS_DOT_CLASS: Record<InstructionStatus, string> = {
  draft: "bg-muted-foreground/50",
  active: "bg-success",
  inactive: "bg-destructive",
};

type InstructionTabLabelProps = {
  instruction: Instruction;
  className?: string;
};

/** Подпись вкладки: имя + цветовой статус (tooltip с расшифровкой). */
export function InstructionTabLabel({
  instruction,
  className,
}: InstructionTabLabelProps) {
  const name = instruction.short_name
    ? `${instruction.name} (${instruction.short_name})`
    : instruction.name;
  const statusLabel = INSTRUCTION_STATUS_LABEL[instruction.status];

  return (
    <span
      className={cn("flex min-w-0 items-center gap-1.5", className)}
      title={statusLabel}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          STATUS_DOT_CLASS[instruction.status],
        )}
        aria-hidden
      />
      <span className="truncate">{name}</span>
      <span className="sr-only">{statusLabel}</span>
    </span>
  );
}
