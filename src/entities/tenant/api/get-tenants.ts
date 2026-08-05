import { apiJson } from "../../../shared/api/api-client";
import type { Tenant } from "../model/tenant.types";

export function getTenants(signal?: AbortSignal): Promise<Tenant[]> {
  return apiJson<Tenant[]>("/api/v1/tenants?hierarchical=true", { signal });
}
