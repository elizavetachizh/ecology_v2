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
import { toPersonWriteBody } from "./map-person-form";
import {
  createEmptyPersonFormValues,
  personFormSchema,
  type PersonFormValues,
} from "./person-form.schema";

type UseUpsertPersonFormParams = {
  mode: "create" | "edit";
  personId?: string;
  initial?: Person | null;
  onSaved: (person: Person, meta: { close: boolean }) => void;
};

function getPersonFormValues(
  mode: "create" | "edit",
  initial?: Person | null,
): PersonFormValues {
  if (mode === "edit" && initial) {
    return {
      name: initial.name,
      first_name: initial.first_name ?? "",
      last_name: initial.last_name ?? "",
      middle_name: initial.middle_name ?? "",
      uuid: initial.uuid ?? "",
    };
  }
  return createEmptyPersonFormValues;
}

export function useUpsertPersonForm({
  mode,
  personId,
  initial,
  onSaved,
}: UseUpsertPersonFormParams) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: getPersonFormValues(mode, initial),
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
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (values: { values: PersonFormValues; close: boolean }) =>
      updatePerson(personId ?? initial!.id, toPersonWriteBody(values.values)),
    onSuccess: (updated, vars) => {
      void queryClient.invalidateQueries({
        queryKey: personsQueryKeys.lists(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (values: PersonFormValues) => {
    setError(null);
    const payload = { values, close: true };
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
