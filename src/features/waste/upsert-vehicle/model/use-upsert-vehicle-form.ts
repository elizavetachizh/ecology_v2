import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createVehicle,
  updateVehicle,
  vehiclesQueryKeys,
  type Vehicle,
} from "../../../../entities/waste/vehicles";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  toVehicleFormValues,
  toVehicleUpdateBody,
  toVehicleWriteBody,
} from "./map-vehicle-form";
import {
  vehicleFormDefaultValues,
  vehicleFormSchema,
  type VehicleFormValues,
} from "./vehicle-form.schema";
import { vehicleWriteErrorMessage } from "./vehicle-write-error";

type UseUpsertVehicleFormParams = {
  mode: "create" | "edit";
  vehicleId?: string;
  initial?: Vehicle | null;
  onSaved: (vehicle: Vehicle, meta: { close: boolean }) => void;
};

export function useUpsertVehicleForm({
  mode,
  vehicleId,
  initial,
  onSaved,
}: UseUpsertVehicleFormParams) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initial
      ? toVehicleFormValues(initial)
      : vehicleFormDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: VehicleFormValues; close: boolean }) =>
      createVehicle(toVehicleWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: vehiclesQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
    },
    onError: (err) => setError(vehicleWriteErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: VehicleFormValues; close: boolean }) =>
      updateVehicle(vehicleId!, toVehicleUpdateBody(vars.values)),
    onSuccess: (updated, vars) => {
      queryClient.setQueryData(
        vehiclesQueryKeys.detail(updated.tenant_id, updated.id),
        updated,
      );
      void queryClient.invalidateQueries({
        queryKey: vehiclesQueryKeys.lists(),
      });
      onSaved(updated, { close: vars.close });
    },
    onError: (err) => setError(vehicleWriteErrorMessage(err)),
  });

  const onSubmit = (close: boolean, values: VehicleFormValues) => {
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
