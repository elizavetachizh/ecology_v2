import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getContracts } from "../api/get-contracts";
import { contractsQueryKeys } from "./contracts-query-keys";
import {
  DEFAULT_CONTRACTS_OPTIONS_LIMIT,
  type ContractStatus,
  type ContractType,
} from "./contracts.types";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UseContractsOptionsArgs = {
  tenantId: string | null;
  enabled?: boolean;
  limit?: number;
  status?: ContractStatus;
  contract_type?: ContractType;
  counterparty_id?: string;
};

/** Options для combobox: debounce search, небольшой limit. */
export function useContractsOptions({
  tenantId,
  enabled = true,
  limit = DEFAULT_CONTRACTS_OPTIONS_LIMIT,
  status,
  contract_type,
  counterparty_id,
}: UseContractsOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    status,
    contract_type,
    counterparty_id,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const query = useQuery({
    queryKey: contractsQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getContracts(listParams, signal),
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
    refetch: query.refetch,
    refreshing: canFetch && query.isFetching && !query.isLoading,
  };
}
