import { queryClient } from "../lib/query-client";
import { clearAllActiveTenantIds } from "./active-tenant-storage";

export async function clearSessionState() {
  await queryClient.cancelQueries();
  queryClient.clear();
  clearAllActiveTenantIds();
}
