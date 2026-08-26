import { useMemo, useState } from "react";
import {
  DEFAULT_UNITS_LIST_LIMIT,
  useUnitsListQuery,
  useUnitsTreeQuery,
  type Unit,
  type UnitTree,
} from "../../../../../../entities/waste/units";
import type { StructureSearch } from "../../../../../../app/router/search-params";
import type { ExpandedState } from "../../../../../../shared/ui";
import { collapsedFromExpanded, expandedFromCollapsed } from "./merge-expanded";

function toTreeRows(items: Unit[]): UnitTree[] {
  return items.map((item) => ({ ...item, children: [] }));
}

type UseUnitsPageDataArgs = {
  tenantId: string | null;
  search: StructureSearch;
  pod9Only: boolean;
};

export function useUnitsPageData({
  tenantId,
  search,
  pod9Only,
}: UseUnitsPageDataArgs) {
  const treeParams = useMemo(
    () => ({
      search: search.q || undefined,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
    }),
    [search.q, search.sort, search.order],
  );

  const listParams = useMemo(
    () => ({
      search: search.q || undefined,
      sort: search.sort ?? ("name" as const),
      order: search.order ?? ("asc" as const),
      is_pod9: true as const,
      limit: search.limit ?? DEFAULT_UNITS_LIST_LIMIT,
      offset: search.offset ?? 0,
    }),
    [search.q, search.sort, search.order, search.limit, search.offset],
  );

  const treeQuery = useUnitsTreeQuery({
    tenantId,
    params: treeParams,
    enabled: !pod9Only,
  });

  const listQuery = useUnitsListQuery({
    tenantId,
    params: listParams,
    enabled: pod9Only,
  });

  const rows = useMemo(
    () => (pod9Only ? toTreeRows(listQuery.items) : treeQuery.tree),
    [pod9Only, listQuery.items, treeQuery.tree],
  );

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const expanded = useMemo(
    () => expandedFromCollapsed(pod9Only ? [] : treeQuery.tree, collapsed),
    [pod9Only, treeQuery.tree, collapsed],
  );

  const setExpanded = (next: ExpandedState) => {
    setCollapsed(collapsedFromExpanded(treeQuery.tree, next));
  };

  return {
    mode: pod9Only ? ("flat" as const) : ("tree" as const),
    rows,
    loading: pod9Only ? listQuery.loading : treeQuery.loading,
    error: pod9Only ? listQuery.error : treeQuery.error,
    pagination: pod9Only
      ? {
          total: listQuery.total,
          limit: listQuery.limit,
          offset: listQuery.offset,
        }
      : null,
    expanded,
    setExpanded,
  };
}
