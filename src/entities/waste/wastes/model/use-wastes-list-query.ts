import { useQuery } from "@tanstack/react-query";
import type { GetWastesParams } from "./wastes.types";
import { wastesQueryKeys } from "./waste-query-keys";
import { getWastes } from "../api/get-wastes";

/** Списки MDM: держим ответ в кэше при переключении sort/filter. */
const LIST_STALE_TIME_MS = 60_000;

type UseWastesListQueryArgs = {
  tenantId: string | null;
  params: GetWastesParams;
  enabled?: boolean;
};

export function useWastesListQuery({
  tenantId,
  params,
  enabled = true,
}: UseWastesListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: wastesQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getWastes(params, signal),
    enabled: canFetch,
    staleTime: LIST_STALE_TIME_MS,
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
 