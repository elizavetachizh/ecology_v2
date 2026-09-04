import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  contractsQueryKeys,
  createContract,
  updateContract,
  type Contract,
  type ContractType,
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
  defaultCounterpartyId?: string;
  defaultContractType?: ContractType;
  onSaved: (contract: Contract, meta: { close: boolean }) => void;
};

export function useUpsertContractForm({
  mode,
  contractId,
  initial,
  defaultCounterpartyId,
  defaultContractType,
  onSaved,
}: UseUpsertContractFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: initial
      ? toContractFormValues(initial)
      : {
          ...contractFormDefaultValues,
          counterparty_id: defaultCounterpartyId ?? "",
          contract_type: defaultContractType ?? "recycling",
        },
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
      queryClient.setQueryData(
        contractsQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: contractsQueryKeys.lists(),
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
