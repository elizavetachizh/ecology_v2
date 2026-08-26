import type { UnitTree } from "../../../../../../entities/waste/units";

/** Узлы с детьми — кандидаты на раскрытие в дереве структуры. */
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
