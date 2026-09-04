import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createWasteSource,
  updateWasteSource,
  wasteSourcesQueryKeys,
  type WasteSource,
} from "../../../../entities/waste/waste-sources";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  wasteSourceFormDefaultValues,
  wasteSourceFormSchema,
  type WasteSourceFormValues,
} from "./waste-source-form.schema";

type UseUpsertWasteSourceFormParams = {
  mode: "create" | "edit";
  initial?: WasteSource | null;
  onSaved: (source: WasteSource) => void;
};

function getWasteSourceFormValues(
  mode: "create" | "edit",
  initial?: WasteSource | null,
): WasteSourceFormValues {
  if (mode === "edit" && initial) return { name: initial.name };
  return wasteSourceFormDefaultValues;
}

export function useUpsertWasteSourceForm({
  mode,
  initial,
  onSaved,
}: UseUpsertWasteSourceFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WasteSourceFormValues>({
    resolver: zodResolver(wasteSourceFormSchema),
    defaultValues: getWasteSourceFormValues(mode, initial),
  });

  const createMutation = useMutation({
    mutationFn: (values: WasteSourceFormValues) =>
      createWasteSource({ name: values.name }),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({
        queryKey: wasteSourcesQueryKeys.lists(),
      });
      onSaved(created);
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (values: WasteSourceFormValues) =>
      updateWasteSource(initial!.id, { name: values.name }),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        wasteSourcesQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: wasteSourcesQueryKeys.lists(),
      });
      onSaved(updated);
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (values: WasteSourceFormValues) => {
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
