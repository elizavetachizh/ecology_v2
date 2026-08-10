import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getDistrictClassifiers } from "../../../../entities/waste/district-classifier";

export function useDistrictClassifierOptions({
  region_id,
}: {
  region_id: number;
}) {
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 400);
  const districtClassifiersQuery = useQuery({
    queryKey: ["district-classifiers", region_id, debouncedSearch],
    queryFn: ({ signal }) =>
      getDistrictClassifiers(
        { search: debouncedSearch, region_id, limit: 20, offset: 0 },
        signal,
      ),
    select: (data) => data.items,
    enabled: Boolean(region_id),
  });

  return {
    options: districtClassifiersQuery.data ?? [],
    loading: districtClassifiersQuery.isLoading,
    error: districtClassifiersQuery.error,
    search,
    setSearch,
  };
}
