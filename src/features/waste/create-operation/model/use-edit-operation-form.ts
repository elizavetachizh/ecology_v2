import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  updateOperation,
  type Operation,
} from "../../../../entities/waste/operations";
import {
  createEditOperationFormSchema,
  toEditOperationFormValues,
  type EditOperationFormValues,
} from "./edit-operation-form.schema";
import { invalidateOperationQueries } from "./invalidate-operation-queries";
import { toOperationUpdateBody } from "./map-edit-operation-form";
import { operationWriteErrorMessage } from "./operation-write-error";

type UseEditOperationFormParams = {
  operation: Operation;
  onSaved: (operation: Operation, meta: { close: boolean }) => void;
};

export function useEditOperationForm({
  operation,
  onSaved,
}: UseEditOperationFormParams) {
  const [error, setError] = useState<string | null>(null);
  const schema = useMemo(
    () => createEditOperationFormSchema(operation.operation_type === "formed"),
    [operation.operation_type],
  );

  const values = useMemo(
    () => toEditOperationFormValues(operation),
    [operation],
  );

  const form = useForm<EditOperationFormValues>({
    resolver: zodResolver(schema),
    values,
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: EditOperationFormValues; close: boolean }) =>
      updateOperation(
        operation.id,
        toOperationUpdateBody(vars.values, operation.operation_type),
      ),
    onSuccess: (updated, vars) => {
      invalidateOperationQueries();
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(operationWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: EditOperationFormValues) => {
    setError(null);
    updateMutation.mutate({ values, close });
  };

  return {
    form,
    error,
    pending: updateMutation.isPending,
    onSubmit,
  };
}
