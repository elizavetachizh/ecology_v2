import type { Unit, UnitTree } from "./units.types";
import { MAX_ANCESTOR_DEPTH, toUnit } from "./find-unit-ancestor-chain";

export const UNIT_PATH_SEPARATOR = " -> ";

export type UnitTreePath = {
  unit: Unit;
  path: Unit[];
};

export function formatUnitPathLabel(path: Pick<Unit, "name">[]): string {
  return path.map((item) => item.name).join(UNIT_PATH_SEPARATOR);
}

type FlattenUnitTreePathsOptions = {
  /** Emit only POD-9 nodes. Every child is still walked so the path is complete. */
  pod9Only?: boolean;
};

/** DFS over the forest: each emitted node carries root → … → node. */
export function flattenUnitTreePaths(
  trees: UnitTree[],
  options: FlattenUnitTreePathsOptions = {},
): UnitTreePath[] {
  const { pod9Only = false } = options;
  const result: UnitTreePath[] = [];

  const walk = (nodes: UnitTree[], ancestors: Unit[]) => {
    for (const node of nodes) {
      if (ancestors.length >= MAX_ANCESTOR_DEPTH) continue;
      const unit = toUnit(node);
      const path = [...ancestors, unit];
      if (!pod9Only || node.is_pod9) {
        result.push({ unit, path });
      }
      if (node.children?.length) {
        walk(node.children, path);
      }
    }
  };

  walk(trees, []);
  return result;
}
