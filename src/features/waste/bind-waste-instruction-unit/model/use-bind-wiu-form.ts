import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createWasteInstructionUnit,
  updateWasteInstructionUnit,
  type WasteInstructionUnit,
  type WasteInstructionUnitScope,
} from "../../../../entities/waste/waste-instruction-units";
import { invalidateBindingQueries } from "../../../../shared/lib/invalidate-binding-queries";
import {
  bindWiuFormDefaultValues,
  bindWiuFormSchema,
  type BindWiuFormValues,
} from "./bind-wiu-form.schema";

type UseBindWiuFormParams = {
  mode: "create" | "edit";
  scope: WasteInstructionUnitScope;
  initial?: WasteInstructionUnit | null;
  onSaved: (binding: WasteInstructionUnit) => void;
};

function valuesFromInitial(initial: WasteInstructionUnit): BindWiuFormValues {
  return {
    unit_id: initial.unit_id,
    waste_source_ids: initial.waste_source_ids,
    transport_unit: initial.transport_unit,
  };
}

export function useBindWiuForm({
  mode,
  scope,
  initial,
  onSaved,
}: UseBindWiuFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BindWiuFormValues>({
    resolver: zodResolver(bindWiuFormSchema),
    defaultValues:
      mode === "edit" && initial
        ? valuesFromInitial(initial)
        : bindWiuFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (values: BindWiuFormValues) =>
      createWasteInstructionUnit(scope, {
        unit_id: values.unit_id,
        waste_source_ids: values.waste_source_ids,
        transport_unit: values.transport_unit,
      }),
    onSuccess: (created) => {
      invalidateBindingQueries();
      onSaved(created);
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (values: BindWiuFormValues) =>
      updateWasteInstructionUnit(scope, initial!.id, {
        unit_id: values.unit_id,
        waste_source_ids: values.waste_source_ids,
        transport_unit: values.transport_unit,
      }),
    onSuccess: (updated) => {
      invalidateBindingQueries();
      onSaved(updated);
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (values: BindWiuFormValues) => {
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
