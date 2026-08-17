import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createOperation,
  operationsQueryKeys,
  updateOperation,
  type Operation,
} from "../../../../entities/waste/operations";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  getOperationFormValues,
  toOperationWriteBody,
} from "./map-operation-form";
import {
  operationFormSchema,
  type OperationFormValues,
} from "./operation-form.schema";

type UseUpsertOperationFormParams = {
  mode: "create" | "edit";
  initial?: Operation | null;
  onSaved: (operation: Operation) => void;
};

function invalidateOperationQueries() {
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.details(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.balances(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.current(),
  });
}

export function useUpsertOperationForm({
  mode,
  initial,
  onSaved,
}: UseUpsertOperationFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationFormSchema),
    defaultValues: getOperationFormValues(mode, initial),
  });

  const createMutation = useMutation({
    mutationFn: (values: OperationFormValues) =>
      createOperation(toOperationWriteBody(values)),
    onSuccess: (created) => {
      invalidateOperationQueries();
      onSaved(created);
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (values: OperationFormValues) =>
      updateOperation(initial!.id, toOperationWriteBody(values)),
    onSuccess: (updated) => {
      invalidateOperationQueries();
      onSaved(updated);
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (values: OperationFormValues) => {
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
