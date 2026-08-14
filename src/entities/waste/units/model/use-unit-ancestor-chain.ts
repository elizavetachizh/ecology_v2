import { useQuery } from "@tanstack/react-query";
import { getUnit } from "../api/get-unit";
import type { Unit } from "./units.types";
import { unitsQueryKeys } from "./unit-query-keys";
import {
  DEFAULT_STALE_TIME_MS,
  queryClient,
} from "../../../../shared/lib/query-client";

const MAX_ANCESTOR_DEPTH = 32;

type UseUnitAncestorChainArgs = {
  tenantId: string | null;
  /** Текущая единица — включается в конец цепочки root → … → unit */
  unit: Unit | null | undefined;
  enabled?: boolean;
};

/**
 * Цепочка предков от корня до unit (walk по parent_id).
 * Кладёт родителей в detail-кэш — клик по крошке открывает уже тёплый запрос.
 */
export function useUnitAncestorChain({
  tenantId,
  unit,
  enabled = true,
}: UseUnitAncestorChainArgs) {
  const canFetch = Boolean(tenantId && unit && enabled);

  const query = useQuery({
    queryKey: [
      ...unitsQueryKeys.detail(tenantId ?? "none", unit?.id ?? "none"),
      "ancestors",
    ] as const,
    queryFn: async ({ signal }) => {
      if (!unit || !tenantId) return [] as Unit[];

      const chain: Unit[] = [unit];
      let parentId = unit.parent_id;
      const seen = new Set<string>([unit.id]);
      let depth = 0;

      while (parentId && depth < MAX_ANCESTOR_DEPTH) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (seen.has(parentId)) break;
        seen.add(parentId);

        const parent = await queryClient.fetchQuery({
          queryKey: unitsQueryKeys.detail(tenantId, parentId),
          queryFn: ({ signal: parentSignal }) =>
            getUnit(parentId!, parentSignal),
          staleTime: DEFAULT_STALE_TIME_MS,
        });

        chain.unshift(parent);
        parentId = parent.parent_id;
        depth += 1;
      }

      return chain;
    },
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    items: query.data ?? (unit ? [unit] : []),
    loading: canFetch && query.isLoading,
    error: query.error,
  };
}
