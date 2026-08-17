import type { QueryClient } from "@tanstack/react-query";
import type { Unit, UnitTree } from "./units.types";
import { unitsQueryKeys } from "./unit-query-keys";

export const MAX_ANCESTOR_DEPTH = 32;

export function toUnit(node: Unit | UnitTree): Unit {
  const unit = { ...node } as Unit & { children?: UnitTree[] };
  delete unit.children;
  return unit;
}

/** Путь root → … → unit в лесу деревьев, либо null если unit нет в кэше. */
export function findPathInTrees(
  trees: UnitTree[],
  unitId: string,
): Unit[] | null {
  const walk = (nodes: UnitTree[], acc: Unit[]): Unit[] | null => {
    for (const node of nodes) {
      if (acc.length >= MAX_ANCESTOR_DEPTH) return null;
      const next = [...acc, toUnit(node)];
      if (node.id === unitId) return next;
      const found = walk(node.children ?? [], next);
      if (found) return found;
    }
    return null;
  };
  return walk(trees, []);
}

export function findCachedAncestorChain(
  queryClient: QueryClient,
  tenantId: string,
  unit: Unit,
): Unit[] | null {
  const trees = queryClient.getQueriesData<UnitTree[]>({
    queryKey: [...unitsQueryKeys.trees(), tenantId],
  });

  for (const [, tree] of trees) {
    if (!tree) continue;
    const path = findPathInTrees(tree, unit.id);
    if (path) {
      path[path.length - 1] = unit;
      return path;
    }
  }

  return null;
}

export function seedUnitDetails(
  queryClient: QueryClient,
  tenantId: string,
  units: Unit[],
) {
  for (const item of units) {
    const key = unitsQueryKeys.detail(tenantId, item.id);
    if (!queryClient.getQueryData(key)) {
      queryClient.setQueryData(key, item);
    }
  }
}
