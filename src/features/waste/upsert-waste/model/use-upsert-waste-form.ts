import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createWaste,
  updateWaste,
  wastesQueryKeys,
  type Waste,
} from "../../../../entities/waste/wastes";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  wasteFormDefaultValues,
  wasteFormSchema,
  type WasteFormValues,
} from "./waste-form.schema";
import { toWasteWriteBody } from "./map-waste-form";

type UseUpsertWasteFormParams = {
  mode: "create" | "edit";
  wasteId?: string;
  initial?: Waste | null;
  onSaved: (waste: Waste, meta: { close: boolean }) => void;
};

export function useUpsertWasteForm({
  mode,
  wasteId,
  initial,
  onSaved,
}: UseUpsertWasteFormParams) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WasteFormValues>({
    resolver: zodResolver(wasteFormSchema),
    defaultValues: initial
      ? {
          waste_classifier_id: initial.waste_classifier_id,
          hazard_class: initial.hazard_class,
          uom: initial.uom,
          physical_state: initial.physical_state,
        }
      : wasteFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: WasteFormValues; close: boolean }) =>
      createWaste(toWasteWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: wastesQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
      setSuccessMessage("Отход успешно создан");
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: WasteFormValues; close: boolean }) =>
      updateWaste(wasteId!, toWasteWriteBody(vars.values)),
    onSuccess: (updated, vars) => {
      void queryClient.invalidateQueries({
        queryKey: wastesQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: wastesQueryKeys.details(),
      });
      onSaved(updated, { close: vars.close });
      setSuccessMessage("Отход успешно обновлён");
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (close: boolean, values: WasteFormValues) => {
    setError(null);
    setSuccessMessage(null);
    if (mode === "edit") updateMutation.mutate({ values, close });
    else createMutation.mutate({ values, close });
  };

  return {
    form,
    error,
    pending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
    successMessage,
  };
}
