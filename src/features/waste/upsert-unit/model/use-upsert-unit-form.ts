import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../../shared/lib/query-client";
import {
  createUnit,
  unitsQueryKeys,
  updateUnit,
  type Unit,
} from "../../../../entities/waste/units";
import {
  unitFormDefaultValues,
  unitFormSchema,
  type UnitFormValues,
} from "./unit-form.schema";
import { toUnitWriteBody } from "./map-unit-form";

type UseUpsertUnitFormParams = {
  mode: "create" | "edit";
  unitId?: string;
  /** Предзаполнение родителя (например из ?parentId=). */
  defaultParentId?: string;
  initial?: Unit | null;
  onSaved: (unit: Unit, meta: { close: boolean }) => void;
};

export function useUpsertUnitForm({
  mode,
  unitId,
  defaultParentId,
  initial,
  onSaved,
}: UseUpsertUnitFormParams) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          short_name: initial.short_name ?? "",
          parent_id: initial.parent_id ?? "",
          region_id: initial.region?.id,
          district_id: initial.district?.id,
        }
      : {
          ...unitFormDefaultValues,
          parent_id: defaultParentId ?? "",
        },
  });
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (vars: { values: UnitFormValues; close: boolean }) =>
      createUnit(toUnitWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.lists(),
      });
      onSaved(created, { close: vars.close });
      setSuccessMessage("Единица успешно создана");
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { values: UnitFormValues; close: boolean }) =>
      updateUnit(unitId!, toUnitWriteBody(vars.values)),
    onSuccess: (updated, vars) => {
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.details(),
      });
      onSaved(updated, { close: vars.close });
      setSuccessMessage("Единица успешно обновлена");
    },
    onError: (err) => setError(err.message),
  });

  const onSubmit = (close: boolean, values: UnitFormValues) => {
    setError(null);
    setSuccessMessage(null);
    if (mode === "edit") updateMutation.mutate({ values, close });
    else createMutation.mutate({ values, close });
  };

  return {
    form,
    error,
    pending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
    successMessage,
  };
}
