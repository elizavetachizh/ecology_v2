import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "./button";

export type InstructionScopedBindingsSectionProps = {
  title: string;
  description: string;
  bindLabel: string;
  bindDisabled?: boolean;
  onBind: () => void;
  instructionsSlot: ReactNode;
  /** Hint when instructions exist but none is selected yet. */
  selectHint?: ReactNode;
  content: ReactNode;
  modal?: ReactNode;
  confirm?: ReactNode;
};

/** Shared chrome for instruction-scoped binding lists (UIW / WIU). */
export function InstructionScopedBindingsSection({
  title,
  description,
  bindLabel,
  bindDisabled = false,
  onBind,
  instructionsSlot,
  selectHint,
  content,
  modal,
  confirm,
}: InstructionScopedBindingsSectionProps) {
  return (
    <section className="mx-auto max-w-4xl space-y-6 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={bindDisabled}
          onClick={onBind}
        >
          <Plus className="size-3.5" />
          {bindLabel}
        </Button>
      </div>

      {instructionsSlot}
      {selectHint}
      {content}
      {modal}
      {confirm}
    </section>
  );
}
