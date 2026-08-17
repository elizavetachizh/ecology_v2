import { useQuery } from "@tanstack/react-query";
import type {
  GetWasteInstructionUnitsParams,
  WasteInstructionUnitScope,
} from "./wiu.types";
import { wiuQueryKeys } from "./wiu-query-keys";
import { getWasteInstructionUnits } from "../api/get-wius";

type UseWasteInstructionUnitsListQueryArgs = {
  tenantId: string | null;
  scope: WasteInstructionUnitScope;
  params: GetWasteInstructionUnitsParams;
  enabled?: boolean;
};
export function useWasteInstructionUnitsListQuery({
  tenantId,
  scope,
  params,
  enabled = true,
}: UseWasteInstructionUnitsListQueryArgs) {
  const canFetch =
    Boolean(tenantId) &&
    Boolean(scope.wasteId) &&
    Boolean(scope.instructionId) &&
    enabled;

  const query = useQuery({
    queryKey: wiuQueryKeys.list(tenantId ?? "none", scope, params),
    queryFn: ({ signal }) => getWasteInstructionUnits(scope, params, signal),
    enabled: canFetch,
  });

  return {
    items: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    limit: query.data?.limit ?? params.limit,
    offset: query.data?.offset ?? params.offset,
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
