import {
  MOCK_STRUCTURE,
  type StructureNode,
} from "./structure.mock";

const tree: StructureNode[] = structuredClone(MOCK_STRUCTURE);




export function getStructureTree(): StructureNode[] {
  return tree;
}




export function findStructureNode(
  nodes: StructureNode[],
  id: string,
): StructureNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findStructureNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}




