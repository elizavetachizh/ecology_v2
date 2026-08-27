import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createPermit,
  permitsQueryKeys,
  updatePermit,
  type Permit,
} from "../../../../entities/waste/permits";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  permitFormDefaultValues,
  permitFormSchema,
  type PermitFormValues,
} from "./permit-form.schema";
import {
  toPermitFormValues,
  toPermitUpdateBody,
  toPermitWriteBody,
} from "./map-permit-form";
import { permitWriteErrorMessage } from "./permit-write-error";

type UseUpsertPermitFormParams = {
  mode: "create" | "edit";
  permitId?: string;
  initial?: Permit | null;
  onSaved: (permit: Permit) => void;
};

export function useUpsertPermitForm({
  mode,
  permitId,
  initial,
  onSaved,
}: UseUpsertPermitFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PermitFormValues>({
    resolver: zodResolver(permitFormSchema),
    defaultValues: initial
      ? toPermitFormValues(initial)
      : permitFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (values: PermitFormValues) =>
      createPermit(toPermitWriteBody(values)),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.lists(),
      });
      onSaved(created);
    },
    onError: (err) => setError(permitWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (values: PermitFormValues) =>
      updatePermit(permitId!, toPermitUpdateBody(values)),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.details(),
      });
      onSaved(updated);
    },
    onError: (err) => setError(permitWriteErrorMessage(err)),
  });

  const onSubmit = (values: PermitFormValues) => {
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
