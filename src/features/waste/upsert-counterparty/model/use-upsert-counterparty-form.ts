import { useEffect, useState } from "react";
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
import { toCounterpartyWriteBody } from "./map-counterparty-form";
import { counterpartyWriteErrorMessage } from "./counterparty-write-error";

type UseUpsertCounterpartyFormParams = {
  mode: "create" | "edit";
  initial?: Counterparty | null;
  open: boolean;
  onSaved: (counterparty: Counterparty) => void;
};

export function toCounterpartyFormValues(
  counterparty: Counterparty,
): CounterpartyFormValues {
  return {
    name: counterparty.name,
    full_name: counterparty.full_name ?? "",
    unp: counterparty.unp ?? "",
    address: counterparty.address ?? "",
    is_individual: counterparty.is_individual,
    is_active: counterparty.is_active,
  };
}

export function useUpsertCounterpartyForm({
  mode,
  initial,
  open,
  onSaved,
}: UseUpsertCounterpartyFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CounterpartyFormValues>({
    resolver: zodResolver(counterpartyFormSchema),
    defaultValues: counterpartyFormDefaultValues,
  });

  useEffect(() => {
    if (!open) return;
    setError(null);
    form.reset(
      mode === "edit" && initial
        ? toCounterpartyFormValues(initial)
        : counterpartyFormDefaultValues,
    );
  }, [open, mode, initial, form]);

  const createMutation = useMutation({
    mutationFn: (values: CounterpartyFormValues) =>
      createCounterparty(toCounterpartyWriteBody(values)),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({
        queryKey: counterpartiesQueryKeys.lists(),
      });
      onSaved(created);
    },
    onError: (err) => setError(counterpartyWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (values: CounterpartyFormValues) =>
      updateCounterparty(initial!.id, toCounterpartyWriteBody(values)),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: counterpartiesQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: counterpartiesQueryKeys.details(),
      });
      onSaved(updated);
    },
    onError: (err) => setError(counterpartyWriteErrorMessage(err)),
  });

  const onSubmit = (values: CounterpartyFormValues) => {
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
