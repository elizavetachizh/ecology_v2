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
  onSaved: (permit: Permit, meta: { close: boolean }) => void;
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
    mutationFn: (vars: { values: PermitFormValues; close: boolean }) =>
      createPermit(toPermitWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(permitWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: PermitFormValues; close: boolean }) =>
      updatePermit(permitId!, toPermitUpdateBody(vars.values)),
    onSuccess: (updated, vars) => {
      queryClient.setQueryData(
        permitsQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: permitsQueryKeys.lists(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(permitWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: PermitFormValues) => {
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
