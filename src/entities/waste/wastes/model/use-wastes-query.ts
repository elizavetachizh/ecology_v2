import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getWastes } from "../api/get-wastes";
import { wastesQueryKeys } from "./waste-query-keys";
import { DEFAULT_WASTES_OPTIONS_LIMIT } from "./wastes.types";

type UseWastesOptionsArgs = {
  tenantId: string | null;
  enabled?: boolean;
  limit?: number;
};

/** Options для combobox: debounce search, небольшой limit. */
export function useWastesOptions({
  tenantId,
  enabled = true,
  limit = DEFAULT_WASTES_OPTIONS_LIMIT,
}: UseWastesOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const wastesQuery = useQuery({
    queryKey: wastesQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getWastes(listParams, signal),
    select: (data) => data.items,
    enabled: canFetch,
  });

  return {
    options: wastesQuery.data ?? [],
    loading: canFetch && wastesQuery.isLoading,
    refreshing: canFetch && wastesQuery.isFetching && !wastesQuery.isLoading,
    error: wastesQuery.error,
    search,
    setSearch,
    refetch: wastesQuery.refetch,
  };
}
