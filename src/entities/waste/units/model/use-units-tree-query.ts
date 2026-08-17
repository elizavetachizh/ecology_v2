import { useQuery } from "@tanstack/react-query";
import { getUnitsTree } from "../api/get-units";
import type { GetUnitsTreeParams, UnitTree } from "./units.types";
import { unitsQueryKeys } from "./unit-query-keys";

const EMPTY_TREE: UnitTree[] = [];

type UseUnitsTreeQueryArgs = {
  tenantId: string | null;
  params?: GetUnitsTreeParams;
  enabled?: boolean;
};

export function useUnitsTreeQuery({
  tenantId,
  params = {},
  enabled = true,
}: UseUnitsTreeQueryArgs) {
  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: unitsQueryKeys.tree(tenantId ?? "none", params),
    queryFn: ({ signal }) => getUnitsTree(params, signal),
    enabled: canFetch,
  });

  return {
    tree: query.data ?? EMPTY_TREE,
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
