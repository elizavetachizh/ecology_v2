import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../../shared/hooks";
import { getInstructions } from "../api/get-instructions";
import {
  DEFAULT_INSTRUCTIONS_OPTIONS_LIMIT,
  type InstructionStatus,
} from "./instructions.types";
import { instructionsQueryKeys } from "./instruction-query-keys";

type UseInstructionsOptionsArgs = {
  /** Активный tenant; без него запрос не уходит. */
  tenantId: string | null;
  /** Доп. флаг (по умолчанию true, если есть tenantId). */
  enabled?: boolean;
  /** Фильтр status (для combobox часто `active`). */
  status?: InstructionStatus;
  limit?: number;
};
 
/**
 * Options для combobox / async select: debounce search, небольшой limit.
 * Для таблицы справочника используйте `useInstructionsListQuery`.
 */
export function useInstructionsOptions({
  tenantId,
  enabled = true,
  status,
  limit = DEFAULT_INSTRUCTIONS_OPTIONS_LIMIT,
}: UseInstructionsOptionsArgs) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const listParams = {
    search: debouncedSearch || undefined,
    status,
    limit,
    offset: 0,
  };

  const canFetch = Boolean(tenantId) && enabled;

  const instructionsQuery = useQuery({
    queryKey: instructionsQueryKeys.list(tenantId ?? "none", listParams),
    queryFn: ({ signal }) => getInstructions(listParams, signal),
    select: (data) => data.items,
    enabled: canFetch,
  });

  return {
    options: instructionsQuery.data ?? [],
    loading: canFetch && instructionsQuery.isLoading,
    error: instructionsQuery.error,
    search,
    setSearch,
  };
}
