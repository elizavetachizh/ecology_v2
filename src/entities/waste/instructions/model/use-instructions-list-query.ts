import { useQuery } from "@tanstack/react-query";
import { getInstructions } from "../api/get-instructions";
import type { GetInstructionsParams } from "./instructions.types";
import { instructionsQueryKeys } from "./instruction-query-keys";

type UseInstructionsListQueryArgs = {
  tenantId: string | null;
  params: GetInstructionsParams;
  enabled?: boolean;
};

/**
 * Серверный список справочника: пагинация, status, sort/order, search.
 * Параметры обычно из URL search (ADR §8).
 */
export function useInstructionsListQuery({
  tenantId,
  params,
  enabled = true,
}: UseInstructionsListQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: instructionsQueryKeys.list(tenantId ?? "none", params),
    queryFn: ({ signal }) => getInstructions(params, signal),
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
 