import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createInstruction,
  instructionsQueryKeys,
  updateInstruction,
  type Instruction,
} from "../../../../entities/waste/instructions";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  instructionFormDefaultValues,
  instructionFormSchema,
  type InstructionFormValues,
} from "./instruction-form.schema";
import {
  toInstructionFormValues,
  toInstructionWriteBody,
} from "./map-instruction-form";

type UseUpsertInstructionFormParams = {
  mode: "create" | "edit";
  instructionId?: string;
  initial?: Instruction | null;
  onSaved: (instruction: Instruction, meta: { close: boolean }) => void;
};

export function useUpsertInstructionForm({
  mode,
  instructionId,
  initial,
  onSaved,
}: UseUpsertInstructionFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InstructionFormValues>({
    resolver: zodResolver(instructionFormSchema),
    defaultValues: initial
      ? toInstructionFormValues(initial)
      : instructionFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: InstructionFormValues; close: boolean }) =>
      createInstruction(toInstructionWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: instructionsQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: InstructionFormValues; close: boolean }) =>
      updateInstruction(instructionId!, toInstructionWriteBody(vars.values)),
    onSuccess: (updated, vars) => {
      queryClient.setQueryData(
        instructionsQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: instructionsQueryKeys.lists(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (close: boolean, values: InstructionFormValues) => {
    setError(null);
    if (mode === "edit") updateMutation.mutate({ values, close });
    else createMutation.mutate({ values, close });
  };

  return {
    form,
    error,
    pending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
}
