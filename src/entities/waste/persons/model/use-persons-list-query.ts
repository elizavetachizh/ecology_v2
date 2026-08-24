import { useQuery } from "@tanstack/react-query";
import { getPersons } from "../api/get-persons";
import type { GetPersonsParams } from "./persons.types";
import { personsQueryKeys } from "./persons-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UsePersonsListQueryArgs = {
  tenantId: string | null;
  params: GetPersonsParams;
  enabled?: boolean;
};

export function usePersonsListQuery({
  tenantId,
  params,
  enabled = true,
}: UsePersonsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: personsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getPersons(params, signal),
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
