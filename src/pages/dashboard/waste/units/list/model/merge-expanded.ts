import type { UnitTree } from "../../../../../../entities/waste/units";
import type { ExpandedState } from "../../../../../../shared/ui";
import { collectExpandableIds } from "./collect-expandable-ids";

/** Все узлы с детьми раскрыты, кроме id, которые пользователь свернул. */
export function expandedFromCollapsed(
  tree: UnitTree[],
  collapsed: Record<string, boolean>,
): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};
  for (const id of collectExpandableIds(tree)) {
    if (!collapsed[id]) expanded[id] = true;
  }
  return expanded;
}

export function collapsedFromExpanded(
  tree: UnitTree[],
  expanded: ExpandedState,
): Record<string, boolean> {
  if (expanded === true) return {};
  const collapsed: Record<string, boolean> = {};
  for (const id of collectExpandableIds(tree)) {
    if (!expanded[id]) collapsed[id] = true;
  }
  return collapsed;
}
