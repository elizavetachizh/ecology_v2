import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createTtn,
  ttnsQueryKeys,
  updateTtn,
  type Ttn,
} from "../../../../entities/waste/ttns";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  ttnFormDefaultValues,
  ttnFormSchema,
  type TtnFormValues,
} from "./ttn-form.schema";
import {
  toTtnFormValues,
  toTtnUpdateBody,
  toTtnWriteBody,
} from "./map-ttn-form";
import { ttnWriteErrorMessage } from "./ttn-write-error";

type UseUpsertTtnFormParams = {
  mode: "create" | "edit";
  ttnId?: string;
  initial?: Ttn | null;
  defaultRecyclingContractId?: string;
  onSaved: (ttn: Ttn) => void;
};

export function useUpsertTtnForm({
  mode,
  ttnId,
  initial,
  defaultRecyclingContractId,
  onSaved,
}: UseUpsertTtnFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TtnFormValues>({
    resolver: zodResolver(ttnFormSchema),
    defaultValues: initial
      ? toTtnFormValues(initial)
      : {
          ...ttnFormDefaultValues,
          recycling_contract_id: defaultRecyclingContractId ?? "",
        },
  });

  const createMutation = useMutation({
    mutationFn: (values: TtnFormValues) => createTtn(toTtnWriteBody(values)),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({
        queryKey: ttnsQueryKeys.lists(),
      });
      onSaved(created);
    },
    onError: (err) => setError(ttnWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (values: TtnFormValues) =>
      updateTtn(ttnId!, toTtnUpdateBody(values)),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ttnsQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: ttnsQueryKeys.lists(),
      });
      onSaved(updated);
    },
    onError: (err) => setError(ttnWriteErrorMessage(err)),
  });

  const onSubmit = (values: TtnFormValues) => {
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
