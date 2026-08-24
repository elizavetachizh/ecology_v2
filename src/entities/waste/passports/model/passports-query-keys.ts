import type { GetPassportsParams } from "./passports.types";

export const passportsQueryKeys = {
  all: ["operations", "passports"] as const,
  lists: () => [...passportsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetPassportsParams) =>
    [...passportsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...passportsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...passportsQueryKeys.details(), tenantId, id] as const,
};
