import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getWasteSources } from "../api/get-waste-sources";
import { wasteSourcesQueryKeys } from "./waste-sources-query-keys";
import { DEFAULT_WASTE_SOURCES_OPTIONS_LIMIT } from "./waste-sources.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseWasteSourcesOptionsArgs = {
  tenantId: string | null;
  enabled?: boolean;
  limit?: number;
};

/** Options для combobox: debounce search, небольшой limit. */
export function useWasteSourcesOptions({
  tenantId,
  enabled = true,
  limit = DEFAULT_WASTE_SOURCES_OPTIONS_LIMIT,
}: UseWasteSourcesOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: wasteSourcesQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getWasteSources(listParams, signal),
    select: (data) => data.items,
    staleTime: DEFAULT_STALE_TIME_MS,
    enabled: canFetch,
  });

  return {
    options: query.data ?? [],
    loading: canFetch && query.isLoading,
    refreshing: canFetch && query.isFetching && !query.isLoading,
    error: query.error,
    search,
    setSearch,
    refetch: query.refetch,
  };
}
