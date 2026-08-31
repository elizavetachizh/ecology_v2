import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  contractsQueryKeys,
  createContract,
  updateContract,
  type Contract,
} from "../../../../entities/waste/contracts";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  contractFormDefaultValues,
  contractFormSchema,
  type ContractFormValues,
} from "./contract-form.schema";
import {
  toContractFormValues,
  toContractUpdateBody,
  toContractWriteBody,
} from "./map-contract-form";
import { contractWriteErrorMessage } from "./contract-write-error";

type UseUpsertContractFormParams = {
  mode: "create" | "edit";
  contractId?: string;
  initial?: Contract | null;
  onSaved: (contract: Contract, meta: { close: boolean }) => void;
};

export function useUpsertContractForm({
  mode,
  contractId,
  initial,
  onSaved,
}: UseUpsertContractFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: initial
      ? toContractFormValues(initial)
      : contractFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: ContractFormValues; close: boolean }) =>
      createContract(toContractWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(contractWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: ContractFormValues; close: boolean }) =>
      updateContract(contractId!, toContractUpdateBody(vars.values)),
    onSuccess: (updated, vars) => {
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.details(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(contractWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: ContractFormValues) => {
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
