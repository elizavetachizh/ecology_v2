import {
  MOCK_STRUCTURE,
  type StructureNode,
} from "./structure.mock";

type Listener = () => void;

let tree: StructureNode[] = structuredClone(MOCK_STRUCTURE);
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getStructureTree(): StructureNode[] {
  return tree;
}

export function subscribeStructure(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetStructureStore() {
  tree = structuredClone(MOCK_STRUCTURE);
  emit();
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

export function findParentId(
  nodes: StructureNode[],
  id: string,
  parentId: string | null = null,
): string | null | undefined {
  for (const node of nodes) {
    if (node.id === id) return parentId;
    if (node.children?.length) {
      const found = findParentId(node.children, id, node.id);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function mapTree(
  nodes: StructureNode[],
  mapper: (node: StructureNode) => StructureNode,
): StructureNode[] {
  return nodes.map((node) => {
    const next = mapper(node);
    if (next.children?.length) {
      return { ...next, children: mapTree(next.children, mapper) };
    }
    return next;
  });
}

function updateChildren(
  nodes: StructureNode[],
  parentId: string,
  updater: (children: StructureNode[]) => StructureNode[],
): StructureNode[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: updater(node.children ?? []) };
    }
    if (node.children?.length) {
      return {
        ...node,
        children: updateChildren(node.children, parentId, updater),
      };
    }
    return node;
  });
}

export type UpsertUnitInput = {
  id: string;
  name: string;
  code?: string;
  parentId: string | null;
};

export function upsertStructureUnit(input: UpsertUnitInput): StructureNode {
  const existing = findStructureNode(tree, input.id);

  if (existing && existing.type === "unit") {
    tree = mapTree(tree, (node) =>
      node.id === input.id
        ? {
            ...node,
            name: input.name,
            code: input.code || "—",
          }
        : node,
    );
    emit();
    return findStructureNode(tree, input.id)!;
  }

  const node: StructureNode = {
    id: input.id,
    name: input.name,
    code: input.code || "—",
    type: "unit",
    typeLabel: "Структурная единица",
    children: [],
  };

  if (input.parentId === null) {
    tree = [...tree, node];
  } else {
    tree = updateChildren(tree, input.parentId, (children) => [
      ...children,
      node,
    ]);
  }

  emit();
  return node;
}

export type InsertPod9Input = {
  id: string;
  name: string;
  period?: string;
  status?: string;
  responsible?: string;
  parentId: string;
};

export function insertPod9(input: InsertPod9Input): StructureNode {
  const node: StructureNode = {
    id: input.id,
    name: input.name,
    type: "pod9",
    typeLabel: "ПОД-9",
    period: input.period || "—",
    status: input.status || "Черновик",
    responsible: input.responsible || undefined,
  };

  tree = updateChildren(tree, input.parentId, (children) => [
    ...children,
    node,
  ]);
  emit();
  return node;
}

export type UpdatePod9Input = {
  id: string;
  name: string;
  period: string;
  status: string;
  responsible: string;
};

export function updatePod9(input: UpdatePod9Input): StructureNode | null {
  const existing = findStructureNode(tree, input.id);
  if (!existing || existing.type !== "pod9") return null;

  tree = mapTree(tree, (node) =>
    node.id === input.id
      ? {
          ...node,
          name: input.name.trim(),
          period: input.period.trim() || "—",
          status: input.status.trim() || "Черновик",
          responsible: input.responsible.trim() || undefined,
        }
      : node,
  );
  emit();
  return findStructureNode(tree, input.id);
}

function collectNodeIds(node: StructureNode): string[] {
  return [
    node.id,
    ...(node.children ?? []).flatMap((child) => collectNodeIds(child)),
  ];
}

export function deleteStructureNode(id: string): string[] {
  let removedIds: string[] = [];

  const removeFromTree = (nodes: StructureNode[]): StructureNode[] =>
    nodes.flatMap((node) => {
      if (node.id === id) {
        removedIds = collectNodeIds(node);
        return [];
      }
      if (!node.children?.length) return [node];
      return [{ ...node, children: removeFromTree(node.children) }];
    });

  tree = removeFromTree(tree);
  if (removedIds.length > 0) emit();
  return removedIds;
}

export function getUnitPod9Children(unitId: string): StructureNode[] {
  const unit = findStructureNode(tree, unitId);
  if (!unit || unit.type !== "unit") return [];
  return (unit.children ?? []).filter((child) => child.type === "pod9");
}

/** Плоский список всех структурных единиц */
export function listStructureUnits(): StructureNode[] {
  const result: StructureNode[] = [];

  const walk = (nodes: StructureNode[]) => {
    for (const node of nodes) {
      if (node.type === "unit") {
        result.push(node);
        if (node.children?.length) walk(node.children);
      }
    }
  };

  walk(tree);
  return result;
}

/** Все журналы ПОД-9 в дереве */
export function listAllPod9(): StructureNode[] {
  const result: StructureNode[] = [];

  const walk = (nodes: StructureNode[]) => {
    for (const node of nodes) {
      if (node.type === "pod9") result.push(node);
      if (node.children?.length) walk(node.children);
    }
  };

  walk(tree);
  return result;
}
