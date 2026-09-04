/** Роли из GET /me: ключ = keyword тенанта. */
export type RolesByKeyword = Readonly<Record<string, readonly string[]>>;

export function tenantKeywords(roles: RolesByKeyword): string[] {
  return Object.keys(roles);
}

export function rolesForKeyword(
  roles: RolesByKeyword,
  keyword: string,
): readonly string[] {
  return roles[keyword] ?? [];
}

export function flattenUserRoles(roles: RolesByKeyword): string[] {
  return [...new Set(Object.values(roles).flat())];
}

export function hasRole(
  roles: RolesByKeyword,
  role: string,
  keyword?: string,
): boolean {
  if (keyword !== undefined) {
    return rolesForKeyword(roles, keyword).includes(role);
  }
  return Object.values(roles).some((list) => list.includes(role));
}

export function hasAnyRole(
  roles: RolesByKeyword,
  requiredRoles: readonly string[],
  keyword?: string,
): boolean {
  return requiredRoles.some((role) => hasRole(roles, role, keyword));
}

export function can(
  roles: RolesByKeyword,
  permission: string,
  keyword?: string,
): boolean {
  return hasRole(roles, permission, keyword);
}
