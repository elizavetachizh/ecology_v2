import type { ReactNode } from "react";
import { can } from "../../../shared/auth/permissions";
import { useAuth } from "../../../shared/auth/auth-context";

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const { roles } = useAuth();
  return can(roles, permission) ? children : fallback;
}
