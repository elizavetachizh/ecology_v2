import type { GetPersonsParams } from "./persons.types";

export const personsQueryKeys = {
  all: ["mdm", "persons"] as const,
  lists: () => [...personsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetPersonsParams) =>
    [...personsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...personsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...personsQueryKeys.details(), tenantId, id] as const,
};
