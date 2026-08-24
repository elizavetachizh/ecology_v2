import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getCounterparties } from "../api/get-counterparties";
import { counterpartiesQueryKeys } from "./counterparties-query-keys";
import { DEFAULT_COUNTERPARTIES_OPTIONS_LIMIT } from "./counterparties.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseCounterpartiesOptionsArgs = {
  tenantId: string | null;
  enabled?: boolean;
  limit?: number;
  is_individual?: boolean;
  /** Показать неактивных в селекте. По умолчанию скрыты (is_active=true). */
  includeInactive?: boolean;
};

/** Options для combobox: debounce search, небольшой limit. */
export function useCounterpartiesOptions({
  tenantId,
  enabled = true,
  limit = DEFAULT_COUNTERPARTIES_OPTIONS_LIMIT,
  is_individual,
  includeInactive = false,
}: UseCounterpartiesOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    is_active: includeInactive ? undefined : true,
    is_individual,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: counterpartiesQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getCounterparties(listParams, signal),
    select: (data) => data.items,
    staleTime: DEFAULT_STALE_TIME_MS,
    enabled: canFetch,
  });

  return {
    options: query.data ?? [],
    loading: canFetch && query.isLoading,
    error: query.error,
    search,
    setSearch,
  };
}
