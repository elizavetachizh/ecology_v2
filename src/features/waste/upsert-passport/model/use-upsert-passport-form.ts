import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createPassport,
  passportsQueryKeys,
  updatePassport,
  type Passport,
} from "../../../../entities/waste/passports";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  passportFormDefaultValues,
  passportFormSchema,
  type PassportFormValues,
} from "./passport-form.schema";
import {
  toPassportFormValues,
  toPassportUpdateBody,
  toPassportWriteBody,
} from "./map-passport-form";
import { passportWriteErrorMessage } from "./passport-write-error";

type UseUpsertPassportFormParams = {
  mode: "create" | "edit";
  passportId?: string;
  initial?: Passport | null;
  defaultRecyclingContractId?: string;
  onSaved: (passport: Passport) => void;
};

export function useUpsertPassportForm({
  mode,
  passportId,
  initial,
  defaultRecyclingContractId,
  onSaved,
}: UseUpsertPassportFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PassportFormValues>({
    resolver: zodResolver(passportFormSchema),
    defaultValues: initial
      ? toPassportFormValues(initial)
      : {
          ...passportFormDefaultValues,
          recycling_contract_id: defaultRecyclingContractId ?? "",
        },
  });

  const createMutation = useMutation({
    mutationFn: (values: PassportFormValues) =>
      createPassport(toPassportWriteBody(values)),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({
        queryKey: passportsQueryKeys.lists(),
      });
      onSaved(created);
    },
    onError: (err) => setError(passportWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (values: PassportFormValues) =>
      updatePassport(passportId!, toPassportUpdateBody(values)),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        passportsQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: passportsQueryKeys.lists(),
      });
      onSaved(updated);
    },
    onError: (err) => setError(passportWriteErrorMessage(err)),
  });

  const onSubmit = (values: PassportFormValues) => {
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
