import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createInstruction,
  instructionsQueryKeys,
  updateInstruction,
  type Instruction,
} from "../../../../entities/waste/instructions";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  instructionFormDefaultValues,
  instructionFormSchema,
  type InstructionFormValues,
} from "./instruction-form.schema";
import {
  toInstructionActivateBody,
  toInstructionDeactivateBody,
  toInstructionWriteBody,
} from "./map-instruction-form";
import type {
  InstructionSaveNext,
  InstructionWriteIntent,
} from "./instruction-save";

type UseUpsertInstructionFormParams = {
  mode: "create" | "edit";
  instructionId?: string;
  initial?: Instruction | null;
  onSaved: (
    instruction: Instruction,
    meta: { next: InstructionSaveNext; intent: InstructionWriteIntent },
  ) => void;
};

function toBody(values: InstructionFormValues, intent: InstructionWriteIntent) {
  if (intent === "deactivate") return toInstructionDeactivateBody();
  if (intent === "activate") return toInstructionActivateBody(values);
  return toInstructionWriteBody(values);
}

export function useUpsertInstructionForm({
  mode,
  instructionId,
  initial,
  onSaved,
}: UseUpsertInstructionFormParams) {
  const form = useForm<InstructionFormValues>({
    resolver: zodResolver(instructionFormSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          short_name: initial.short_name ?? "",
          start_date: initial.start_date ?? "",
          end_date: initial.end_date ?? "",
        }
      : instructionFormDefaultValues,
  });
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (vars: {
      values: InstructionFormValues;
      next: InstructionSaveNext;
      intent: InstructionWriteIntent;
    }) => createInstruction(toBody(vars.values, vars.intent)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: instructionsQueryKeys.lists(),
      });
      onSaved(created, { next: vars.next, intent: vars.intent });
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: {
      values: InstructionFormValues;
      next: InstructionSaveNext;
      intent: InstructionWriteIntent;
    }) => updateInstruction(instructionId!, toBody(vars.values, vars.intent)),
    onSuccess: (updated, vars) => {
      void queryClient.invalidateQueries({
        queryKey: instructionsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: instructionsQueryKeys.details(),
      });
      onSaved(updated, { next: vars.next, intent: vars.intent });
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (
    next: InstructionSaveNext,
    values: InstructionFormValues,
    intent: InstructionWriteIntent,
  ) => {
    setError(null);
    const vars = { values, next, intent };
    if (mode === "edit") updateMutation.mutate(vars);
    else createMutation.mutate(vars);
  };

  return {
    form,
    error,
    pending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
}
