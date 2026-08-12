import { queryClient } from "../lib/query-client";
import { clearAllActiveTenantIds } from "./active-tenant-storage";

export function clearTenantState() {}

export async function clearSessionState() {
  await queryClient.cancelQueries();
  queryClient.clear();
  clearTenantState();
  clearAllActiveTenantIds();
}
