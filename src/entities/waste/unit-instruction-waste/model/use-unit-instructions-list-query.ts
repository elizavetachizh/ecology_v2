import { useQuery } from "@tanstack/react-query";
import { getUnitInstructions } from "../api/get-unit-instructions";
import { uiwQueryKeys } from "./uiw-query-keys";
import type { GetUnitInstructionsParams } from "./uiw.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseUnitInstructionsListQueryArgs = {
  tenantId: string | null;
  unitId: string;
  params: GetUnitInstructionsParams;
  enabled?: boolean;
};

export function useUnitInstructionsListQuery({
  tenantId,
  unitId,
  params,
  enabled = true,
}: UseUnitInstructionsListQueryArgs) {
  const canFetch = Boolean(tenantId) && Boolean(unitId) && enabled;

  const query = useQuery({
    queryKey: uiwQueryKeys.unitInstructionList(
      tenantId ?? "none",
      unitId,
      params,
    ),
    queryFn: ({ signal }) => getUnitInstructions(unitId, params, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
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
