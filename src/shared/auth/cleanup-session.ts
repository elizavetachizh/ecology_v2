import { resetWastesStore } from "../../entities/waste/directory";
import { resetFormationSourcesStore } from "../../entities/waste/formation-source";
import { resetStructureStore } from "../../pages/dashboard/directories/model/structure.store";
import { queryClient } from "../lib/query-client";

export function clearTenantState() {
  resetWastesStore();
  resetFormationSourcesStore();
  resetStructureStore();
}

export async function clearSessionState() {
  await queryClient.cancelQueries();
  queryClient.clear();
  clearTenantState();
}
