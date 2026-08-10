import { resetWastesStore } from "../../entities/waste/directory";
import { resetFormationSourcesStore } from "../../entities/waste/formation-source";
import { queryClient } from "../lib/query-client";
import { clearAllActiveTenantIds } from "./active-tenant-storage";

export function clearTenantState() {
  resetWastesStore();
  resetFormationSourcesStore();
}

export async function clearSessionState() {
  await queryClient.cancelQueries();
  queryClient.clear();
  clearTenantState();
  clearAllActiveTenantIds();
}
