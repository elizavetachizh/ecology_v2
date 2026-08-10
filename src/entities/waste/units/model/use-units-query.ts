import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { unitsQueryKeys } from "./unit-query-keys";
import { getUnits } from "../api/get-units";

type UseUnitsOptionsArgs = {
  tenantId: string | null;
  enabled?: boolean;
  limit?: number;
};

/**
 * Options для combobox / async select: debounce search, небольшой limit.
 * Для дерева структуры используйте `useUnitsTreeQuery`.
 */
export function useUnitsOptions({
  tenantId,
  enabled = true,
  limit = 20,
}: UseUnitsOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const unitsQuery = useQuery({
    queryKey: unitsQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getUnits(listParams, signal),
    select: (data) => data.items,
    enabled: canFetch,
  });

  return {
    options: unitsQuery.data ?? [],
    loading: canFetch && unitsQuery.isLoading,
    error: unitsQuery.error,
    search,
    setSearch,
  };
}
