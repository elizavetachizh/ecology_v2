import { useEffect, useState } from "react";
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
  open: boolean;
  onSaved: (source: WasteSource) => void;
};

export function useUpsertWasteSourceForm({
  mode,
  initial,
  open,
  onSaved,
}: UseUpsertWasteSourceFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WasteSourceFormValues>({
    resolver: zodResolver(wasteSourceFormSchema),
    defaultValues: wasteSourceFormDefaultValues,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    form.reset(
      mode === "edit" && initial
        ? { name: initial.name }
        : wasteSourceFormDefaultValues,
    );
  }, [open, mode, initial, form]);

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
      void queryClient.invalidateQueries({
        queryKey: wasteSourcesQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: wasteSourcesQueryKeys.details(),
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
