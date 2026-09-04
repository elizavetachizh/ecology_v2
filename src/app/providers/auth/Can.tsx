import type { ReactNode } from "react";
import { useTenant } from "../../../entities/tenant";
import { can } from "../../../shared/auth/permissions";

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const { user } = useTenant();
  return can(user.roles, permission) ? children : fallback;
}
