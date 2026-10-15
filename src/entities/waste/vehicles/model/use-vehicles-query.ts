import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getVehicles } from "../api/get-vehicles";
import { vehiclesQueryKeys } from "./vehicles-query-keys";
import { DEFAULT_VEHICLES_OPTIONS_LIMIT } from "./vehicles.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseVehiclesOptionsArgs = {
  tenantId: string | null;
  enabled?: boolean;
  limit?: number;
};

/** Options для combobox: debounce search, только активный транспорт. */
export function useVehiclesOptions({
  tenantId,
  enabled = true,
  limit = DEFAULT_VEHICLES_OPTIONS_LIMIT,
}: UseVehiclesOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    status: "active" as const,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: vehiclesQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getVehicles(listParams, signal),
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
