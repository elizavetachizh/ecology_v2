import type { Tenant } from "./tenant.types";

export const MAX_TENANT_DEPTH = 8;

export type TenantTreeNode = {
  tenant: Tenant;
  depth: number;
};

export function tenantLabel(tenant: Pick<Tenant, "name" | "short">): string {
  return tenant.short.trim() || tenant.name;
}

export function flattenTenantTree(tenants: Tenant[]): TenantTreeNode[] {
  const result: TenantTreeNode[] = [];
  const visited = new Set<string>();

  const walk = (nodes: Tenant[], depth: number) => {
    if (depth >= MAX_TENANT_DEPTH) return;
    for (const tenant of nodes) {
      if (visited.has(tenant.id)) continue;
      visited.add(tenant.id);
      result.push({ tenant, depth });
      if (tenant.children?.length) {
        walk(tenant.children, depth + 1);
      }
    }
  };

  walk(tenants, 0);
  return result;
}

function matchesQuery(tenant: Tenant, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    tenant.name.toLowerCase().includes(needle) ||
    tenant.short.toLowerCase().includes(needle)
  );
}

/** Поиск сохраняет ветку: предки и потомки совпадений остаются в дереве. */
export function filterTenantTree(
  tenants: Tenant[],
  query: string,
): TenantTreeNode[] {
  const flat = flattenTenantTree(tenants);
  const needle = query.trim();
  if (!needle) return flat;

  const byId = new Map(flat.map((node) => [node.tenant.id, node]));
  const matchIds = new Set(
    flat
      .filter((node) => matchesQuery(node.tenant, needle))
      .map((node) => node.tenant.id),
  );
  if (matchIds.size === 0) return [];

  const visible = new Set<string>(matchIds);

  const walkUp = (id: string) => {
    let parentId = byId.get(id)?.tenant.parent_id ?? null;
    while (parentId) {
      visible.add(parentId);
      parentId = byId.get(parentId)?.tenant.parent_id ?? null;
    }
  };

  for (const id of matchIds) {
    walkUp(id);
  }

  for (const node of flat) {
    let parentId = node.tenant.parent_id;
    while (parentId) {
      if (matchIds.has(parentId)) {
        visible.add(node.tenant.id);
        break;
      }
      parentId = byId.get(parentId)?.tenant.parent_id ?? null;
    }
  }

  return flat.filter((node) => visible.has(node.tenant.id));
}
