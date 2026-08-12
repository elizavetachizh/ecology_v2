import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createUnitInstructionWaste,
  updateUnitInstructionWaste,
  uiwQueryKeys,
  type UnitInstructionWaste,
  type UnitInstructionWasteScope,
} from "../../../../entities/waste/unit-instruction-waste";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  bindUiwFormDefaultValues,
  bindUiwFormSchema,
  type BindUiwFormValues,
} from "./bind-uiw-form.schema";

type UseBindUiwFormParams = {
  mode: "create" | "edit";
  scope: UnitInstructionWasteScope;
  initial?: UnitInstructionWaste | null;
  open: boolean;
  onSaved: (binding: UnitInstructionWaste) => void;
};

export function useBindUiwForm({
  mode,
  scope,
  initial,
  open,
  onSaved,
}: UseBindUiwFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BindUiwFormValues>({
    resolver: zodResolver(bindUiwFormSchema),
    defaultValues: bindUiwFormDefaultValues,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    form.reset(
      mode === "edit" && initial
        ? {
            waste_id: initial.waste_id,
            waste_source_ids: initial.waste_source_ids,
            transport_unit: initial.transport_unit,
          }
        : bindUiwFormDefaultValues,
    );
  }, [open, mode, initial, form]);

  const createMutation = useMutation({
    mutationFn: (values: BindUiwFormValues) =>
      createUnitInstructionWaste(scope, {
        waste_id: values.waste_id,
        waste_source_ids: values.waste_source_ids,
        transport_unit: values.transport_unit,
      }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: uiwQueryKeys.lists() });
      onSaved(created);
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (values: BindUiwFormValues) =>
      updateUnitInstructionWaste(scope, initial!.id, {
        waste_id: values.waste_id,
        waste_source_ids: values.waste_source_ids,
        transport_unit: values.transport_unit,
      }),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({ queryKey: uiwQueryKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: uiwQueryKeys.details() });
      onSaved(updated);
    },
    onError: (err) => setError(err.message),
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
