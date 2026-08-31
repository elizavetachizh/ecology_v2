import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createStandard,
  standardsQueryKeys,
  updateStandard,
  type Standard,
} from "../../../../entities/waste/standards";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  standardFormDefaultValues,
  standardFormSchema,
  type StandardFormValues,
} from "./standard-form.schema";
import {
  toStandardFormValues,
  toStandardUpdateBody,
  toStandardWriteBody,
} from "./map-standard-form";
import { standardWriteErrorMessage } from "./standard-write-error";

type UseUpsertStandardFormParams = {
  mode: "create" | "edit";
  standardId?: string;
  initial?: Standard | null;
  onSaved: (standard: Standard, meta: { close: boolean }) => void;
};

export function useUpsertStandardForm({
  mode,
  standardId,
  initial,
  onSaved,
}: UseUpsertStandardFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<StandardFormValues>({
    resolver: zodResolver(standardFormSchema),
    defaultValues: initial
      ? toStandardFormValues(initial)
      : standardFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: StandardFormValues; close: boolean }) =>
      createStandard(toStandardWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: standardsQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(standardWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: StandardFormValues; close: boolean }) =>
      updateStandard(standardId!, toStandardUpdateBody(vars.values)),
    onSuccess: (updated, vars) => {
      void queryClient.invalidateQueries({
        queryKey: standardsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: standardsQueryKeys.details(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(standardWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: StandardFormValues) => {
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
