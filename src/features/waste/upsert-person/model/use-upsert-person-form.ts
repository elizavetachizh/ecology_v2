import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createPerson,
  personsQueryKeys,
  updatePerson,
  type Person,
} from "../../../../entities/waste/persons";
import { queryClient } from "../../../../shared/lib/query-client";
import { toPersonFormValues, toPersonWriteBody } from "./map-person-form";
import {
  createEmptyPersonFormValues,
  personFormSchema,
  type PersonFormValues,
} from "./person-form.schema";
import { personWriteErrorMessage } from "./person-write-error";

type UseUpsertPersonFormParams = {
  mode: "create" | "edit";
  personId?: string;
  initial?: Person | null;
  onSaved: (person: Person, meta: { close: boolean }) => void;
};

export function useUpsertPersonForm({
  mode,
  personId,
  initial,
  onSaved,
}: UseUpsertPersonFormParams) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues:
      mode === "edit" && initial
        ? toPersonFormValues(initial)
        : createEmptyPersonFormValues,
  });

  const createMutation = useMutation({
    mutationFn: (values: { values: PersonFormValues; close: boolean }) =>
      createPerson(toPersonWriteBody(values.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: personsQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(personWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (values: { values: PersonFormValues; close: boolean }) =>
      updatePerson(personId ?? initial!.id, toPersonWriteBody(values.values)),
    onSuccess: (updated, vars) => {
      queryClient.setQueryData(
        personsQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: personsQueryKeys.lists(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(personWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: PersonFormValues) => {
    setError(null);
    const payload = { values, close };
    if (mode === "edit") updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  return {
    form,
    error,
    pending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
}
