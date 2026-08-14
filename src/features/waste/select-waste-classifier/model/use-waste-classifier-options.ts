import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getWasteClassifiers } from "../../../../entities/waste/waste-classifier";
import { useDebounce } from "../../../../shared/hooks";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

export function useWasteClassifierOptions() {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const wasteClassifiersQuery = useQuery({
    queryKey: ["waste-classifiers", debouncedSearch],
    queryFn: ({ signal }) =>
      getWasteClassifiers(
        { search: debouncedSearch, limit: 20, offset: 0 },
        signal,
      ),
    select: (data) => data.items,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    options: wasteClassifiersQuery.data ?? [],
    loading: wasteClassifiersQuery.isLoading,
    error: wasteClassifiersQuery.error,
    search,
    setSearch,
  };
}
