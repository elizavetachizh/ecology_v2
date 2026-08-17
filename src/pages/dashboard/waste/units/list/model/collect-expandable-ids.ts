import type { UnitTree } from "../../../../../../entities/waste/units";

/** Узлы с детьми — их надо раскрыть, чтобы matches ∪ ancestors были видны. */
export function collectExpandableIds(nodes: UnitTree[]): string[] {
  const ids: string[] = [];
  const walk = (list: UnitTree[]) => {
    for (const node of list) {
      if (node.children?.length) {
        ids.push(node.id);
        walk(node.children);
      }
    }
  };
  walk(nodes);
  return ids;
}
