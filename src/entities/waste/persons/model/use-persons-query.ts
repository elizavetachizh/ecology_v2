import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getPersons } from "../api/get-persons";
import { personsQueryKeys } from "./persons-query-keys";
import { DEFAULT_PERSONS_OPTIONS_LIMIT } from "./persons.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UsePersonsOptionsArgs = {
  tenantId: string | null;
  enabled?: boolean;
  limit?: number;
};

/** Options для combobox: debounce search, небольшой limit. */
export function usePersonsOptions({
  tenantId,
  enabled = true,
  limit = DEFAULT_PERSONS_OPTIONS_LIMIT,
}: UsePersonsOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: personsQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getPersons(listParams, signal),
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
