import { MAX_ANCESTOR_DEPTH, toUnit } from "./find-unit-ancestor-chain";
import { unitLabel } from "./unit-label";
import type { Unit, UnitTree } from "./units.types";

export const UNIT_PATH_SEPARATOR = " -> ";
export const UNIT_TREE_INDENT_REM = 0.75;

export type UnitTreePath = {
  unit: Unit;
  path: Unit[];
};

/** Depth 0 = root. Used to indent children in hierarchical selects. */
export function unitTreeDepth(path: { length: number }): number {
  return Math.max(0, path.length - 1);
}

export function unitTreeDepthStyle(depth: number): { paddingLeft: string } {
  return { paddingLeft: `${depth * UNIT_TREE_INDENT_REM}rem` };
}

export function formatUnitPathLabel(
  path: Pick<Unit, "name" | "short_name">[],
): string {
  return path.map((item) => unitLabel(item)).join(UNIT_PATH_SEPARATOR);
}

export type UnitComboboxOption = {
  value: string;
  label: string;
  isPod9: boolean;
  /** Только режим `tree`: отступ по глубине узла. */
  labelStyles?: { paddingLeft: string };
};

/** Пункты комбобокса из уже собранных путей: дерево с отступом или полный путь. */
export function unitComboboxOptions(
  entries: UnitTreePath[],
  mode: "tree" | "path",
): UnitComboboxOption[] {
  return entries.map((item) => {
    const option: UnitComboboxOption = {
      value: item.unit.id,
      label:
        mode === "tree" ? unitLabel(item.unit) : formatUnitPathLabel(item.path),
      isPod9: item.unit.is_pod9,
    };
    if (mode === "tree") {
      option.labelStyles = unitTreeDepthStyle(unitTreeDepth(item.path));
    }
    return option;
  });
}

type FlattenUnitTreePathsOptions = {
  /** Emit only POD-9 nodes. Every child is still walked so the path is complete. */
  pod9Only?: boolean;
  /** Skip POD-9 nodes and their children. */
  excludePod9?: boolean;
};

/** DFS over the forest: each emitted node carries root → … → node. */
export function flattenUnitTreePaths(
  trees: UnitTree[],
  options: FlattenUnitTreePathsOptions = {},
): UnitTreePath[] {
  const { pod9Only = false, excludePod9 = false } = options;
  const result: UnitTreePath[] = [];

  const walk = (nodes: UnitTree[], ancestors: Unit[]) => {
    for (const node of nodes) {
      if (ancestors.length >= MAX_ANCESTOR_DEPTH) continue;
      if (excludePod9 && node.is_pod9) continue;
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
