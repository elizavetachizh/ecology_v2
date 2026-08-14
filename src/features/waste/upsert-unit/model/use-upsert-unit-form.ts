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
  /** Предзаполнение флага ПОД-9 (например из ?isPod9=true). */
  defaultIsPod9?: boolean;
  /** Наследование territory от родителя при create с ?parentId=. */
  defaultRegionId?: number;
  defaultDistrictId?: number;
  initial?: Unit | null;
  onSaved: (unit: Unit, meta: { close: boolean }) => void;
};

function valuesFromUnit(unit: Unit): UnitFormValues {
  return {
    name: unit.name,
    short_name: unit.short_name ?? "",
    parent_id: unit.parent_id ?? "",
    region_id: unit.region?.id,
    district_id: unit.district?.id,
    is_pod9: unit.is_pod9 ?? false,
  };
}

export function useUpsertUnitForm({
  mode,
  unitId,
  defaultParentId,
  defaultIsPod9 = false,
  defaultRegionId,
  defaultDistrictId,
  initial,
  onSaved,
}: UseUpsertUnitFormParams) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: initial
      ? valuesFromUnit(initial)
      : {
          ...unitFormDefaultValues,
          parent_id: defaultParentId ?? "",
          is_pod9: defaultIsPod9,
          region_id: defaultRegionId,
          district_id: defaultDistrictId,
        },
  });

  const createMutation = useMutation({
    mutationFn: (vars: { values: UnitFormValues; close: boolean }) =>
      createUnit(toUnitWriteBody(vars.values)),
    onSuccess: (created, vars) => {
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.trees(),
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
        queryKey: unitsQueryKeys.trees(),
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
