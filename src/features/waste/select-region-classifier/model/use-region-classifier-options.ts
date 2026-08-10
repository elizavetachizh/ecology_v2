import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getRegionClassifiers } from "../../../../entities/waste/region-classifier";

export function useRegionClassifierOptions() {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const regionClassifiersQuery = useQuery({
    queryKey: ["region-classifiers", debouncedSearch],
    queryFn: ({ signal }) =>
      getRegionClassifiers(
        { search: debouncedSearch, limit: 20, offset: 0 },
        signal,
      ),
    select: (data) => data.items,
  });

  return {
    options: regionClassifiersQuery.data ?? [],
    loading: regionClassifiersQuery.isLoading,
    error: regionClassifiersQuery.error,
    search,
    setSearch,
  };
}
