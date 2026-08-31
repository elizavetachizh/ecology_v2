import { operationsQueryKeys } from "../../../../entities/waste/operations";
import { queryClient } from "../../../../shared/lib/query-client";

export function invalidateOperationQueries() {
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.details(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.balances(),
  });
  void queryClient.invalidateQueries({
    queryKey: operationsQueryKeys.current(),
  });
}
