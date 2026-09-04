import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createOrder,
  ordersQueryKeys,
  updateOrder,
  type Order,
} from "../../../../entities/waste/orders";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  orderFormDefaultValues,
  orderFormSchema,
  type OrderFormValues,
} from "./order-form.schema";
import {
  toOrderFormValues,
  toOrderUpdateBody,
  toOrderWriteBody,
} from "./map-order-form";
import { orderWriteErrorMessage } from "./order-write-error";

type UseUpsertOrderFormParams = {
  mode: "create" | "edit";
  orderId?: string;
  initial?: Order | null;
  onSaved: (order: Order, meta: { close: boolean }) => void;
};

export function useUpsertOrderForm({
  mode,
  orderId,
  initial,
  onSaved,
}: UseUpsertOrderFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: initial
      ? toOrderFormValues(initial)
      : orderFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: OrderFormValues; close: boolean }) =>
      createOrder(toOrderWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(orderWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: OrderFormValues; close: boolean }) =>
      updateOrder(orderId!, toOrderUpdateBody(vars.values)),
    onSuccess: (updated, vars) => {
      queryClient.setQueryData(
        ordersQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(orderWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: OrderFormValues) => {
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
