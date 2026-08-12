import { useQuery } from "@tanstack/react-query";
import { getUnitInstructionWastes } from "../api/get-unit-instruction-wastes";
import { uiwQueryKeys } from "./uiw-query-keys";
import type {
  GetUnitInstructionWastesParams,
  UnitInstructionWasteScope,
} from "./uiw.types";

type UseUnitInstructionWastesListQueryArgs = {
  tenantId: string | null;
  scope: UnitInstructionWasteScope;
  params: GetUnitInstructionWastesParams;
  enabled?: boolean;
};

export function useUnitInstructionWastesListQuery({
  tenantId,
  scope,
  params,
  enabled = true,
}: UseUnitInstructionWastesListQueryArgs) {
  const canFetch =
    Boolean(tenantId) &&
    Boolean(scope.unitId) &&
    Boolean(scope.instructionId) &&
    enabled;

  const query = useQuery({
    queryKey: uiwQueryKeys.list(tenantId ?? "none", scope, params),
    queryFn: ({ signal }) => getUnitInstructionWastes(scope, params, signal),
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
