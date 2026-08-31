import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createOperation,
  type Operation,
} from "../../../../entities/waste/operations";
import { toOperationWriteBody } from "./map-operation-form";
import { invalidateOperationQueries } from "./invalidate-operation-queries";
import {
  createEmptyOperationFormValues,
  operationFormSchema,
  type OperationFormValues,
} from "./operation-form.schema";

type UseCreateOperationFormParams = {
  onSaved: (operation: Operation) => void;
};

export function useCreateOperationForm({
  onSaved,
}: UseCreateOperationFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OperationFormValues>({
    resolver: zodResolver(operationFormSchema),
    defaultValues: createEmptyOperationFormValues(),
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

  const onSubmit = (values: OperationFormValues) => {
    setError(null);
    createMutation.mutate(values);
  };

  return {
    form,
    error,
    pending: createMutation.isPending,
    onSubmit,
    clearError: () => setError(null),
  };
}
