import type { AuthClaims } from "./auth.types";

export function getRealmRoles(
  claims: AuthClaims | null | undefined,
): readonly string[] {
  return claims?.realm_access?.roles ?? [];
}

export function hasRole(
  roles: readonly string[],
  role: string,
): boolean {
  return roles.includes(role);
}

export function hasAnyRole(
  roles: readonly string[],
  requiredRoles: readonly string[],
): boolean {
  return requiredRoles.some((role) => hasRole(roles, role));
}

export function can(
  roles: readonly string[],
  permission: string,
): boolean {
  return hasRole(roles, permission);
}
