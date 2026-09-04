import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createUnitInstructionWaste,
  updateUnitInstructionWaste,
  type UnitInstructionWaste,
  type UnitInstructionWasteScope,
} from "../../../../entities/waste/unit-instruction-waste";
import { invalidateBindingQueries } from "../../../../shared/lib/invalidate-binding-queries";
import {
  bindUiwFormDefaultValues,
  bindUiwFormSchema,
  type BindUiwFormValues,
} from "./bind-uiw-form.schema";
import { uiwWriteErrorMessage } from "./uiw-write-error";

type UseBindUiwFormParams = {
  mode: "create" | "edit";
  scope: UnitInstructionWasteScope;
  initial?: UnitInstructionWaste | null;
  onSaved: (binding: UnitInstructionWaste) => void;
};

function valuesFromInitial(initial: UnitInstructionWaste): BindUiwFormValues {
  return {
    waste_id: initial.waste_id,
    waste_source_ids: initial.waste_source_ids,
    transport_unit: initial.transport_unit,
  };
}

export function useBindUiwForm({
  mode,
  scope,
  initial,
  onSaved,
}: UseBindUiwFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BindUiwFormValues>({
    resolver: zodResolver(bindUiwFormSchema),
    defaultValues:
      mode === "edit" && initial
        ? valuesFromInitial(initial)
        : bindUiwFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (values: BindUiwFormValues) =>
      createUnitInstructionWaste(scope, {
        waste_id: values.waste_id,
        waste_source_ids: values.waste_source_ids,
        transport_unit: values.transport_unit,
      }),
    onSuccess: (created) => {
      invalidateBindingQueries();
      onSaved(created);
    },
    onError: (err) => setError(uiwWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (values: BindUiwFormValues) =>
      updateUnitInstructionWaste(scope, initial!.id, {
        waste_id: values.waste_id,
        waste_source_ids: values.waste_source_ids,
        transport_unit: values.transport_unit,
      }),
    onSuccess: (updated) => {
      invalidateBindingQueries();
      onSaved(updated);
    },
    onError: (err) => setError(uiwWriteErrorMessage(err)),
  });

  const onSubmit = (values: BindUiwFormValues) => {
    setError(null);
    if (mode === "edit") updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  return {
    form,
    error,
    pending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
}
