import { useMutation } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import {
  operationsQueryKeys,
  updatePeriodLock,
  type PeriodLockUpdate,
} from "../../../../entities/waste/operations";
import { formatDate } from "../../../../shared/lib/format-date";
import { queryClient } from "../../../../shared/lib/query-client";
import { toast } from "../../../../shared/ui";

export function useUpdatePeriodLock() {
  const { activeTenantId } = useTenant();

  return useMutation({
    mutationFn: (body: PeriodLockUpdate) => updatePeriodLock(body),
    onSuccess: (saved) => {
      if (activeTenantId) {
        void queryClient.invalidateQueries({
          queryKey: operationsQueryKeys.periodLock(activeTenantId),
        });
      }
      toast.success(
        saved.lock_date
          ? `Период закрыт по ${formatDate(saved.lock_date)}`
          : "Период открыт",
      );
    },
    onError: (err) => toast.error(err.message),
  });
}
