import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  deleteUnit,
  unitsQueryKeys,
  type Unit,
} from "../../../../../../entities/waste/units";
import { queryClient } from "../../../../../../shared/lib/query-client";

export function useDeleteUnit() {
  const [deletingUnit, setDeletingUnit] = useState<Unit | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUnit(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.lists(),
      });
      void queryClient.invalidateQueries({
        queryKey: unitsQueryKeys.trees(),
      });
      setDeletingUnit(null);
    },
  });

  return {
    deletingUnit,
    setDeletingUnit,
    isPending: deleteMutation.isPending,
    close: () => setDeletingUnit(null),
    confirm: async () => {
      if (!deletingUnit) return;
      await deleteMutation.mutateAsync(deletingUnit.id);
    },
  };
}
