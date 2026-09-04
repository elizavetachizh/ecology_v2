import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  counterpartiesQueryKeys,
  createCounterparty,
  updateCounterparty,
  type Counterparty,
} from "../../../../entities/waste/counterparties";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  counterpartyFormDefaultValues,
  counterpartyFormSchema,
  type CounterpartyFormValues,
} from "./counterparty-form.schema";
import {
  toCounterpartyFormValues,
  toCounterpartyWriteBody,
} from "./map-counterparty-form";
import { counterpartyWriteErrorMessage } from "./counterparty-write-error";

type UseUpsertCounterpartyFormParams = {
  mode: "create" | "edit";
  counterpartyId?: string;
  initial?: Counterparty | null;
  onSaved: (counterparty: Counterparty, meta: { close: boolean }) => void;
};

export function useUpsertCounterpartyForm({
  mode,
  counterpartyId,
  initial,
  onSaved,
}: UseUpsertCounterpartyFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CounterpartyFormValues>({
    resolver: zodResolver(counterpartyFormSchema),
    defaultValues:
      mode === "edit" && initial
        ? toCounterpartyFormValues(initial)
        : counterpartyFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: CounterpartyFormValues; close: boolean }) =>
      createCounterparty(toCounterpartyWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: counterpartiesQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(counterpartyWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: CounterpartyFormValues; close: boolean }) =>
      updateCounterparty(
        counterpartyId ?? initial!.id,
        toCounterpartyWriteBody(vars.values),
      ),
    onSuccess: (updated, vars) => {
      queryClient.setQueryData(
        counterpartiesQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: counterpartiesQueryKeys.lists(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(counterpartyWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: CounterpartyFormValues) => {
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
