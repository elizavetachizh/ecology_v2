import type {
  GetPersonAssignmentsParams,
  GetPersonsParams,
} from "./persons.types";

export const personsQueryKeys = {
  all: ["mdm", "persons"] as const,
  lists: () => [...personsQueryKeys.all, "list"] as const,
  list: (tenantId: string, params: GetPersonsParams) =>
    [...personsQueryKeys.lists(), tenantId, params] as const,
  details: () => [...personsQueryKeys.all, "detail"] as const,
  detail: (tenantId: string, id: string) =>
    [...personsQueryKeys.details(), tenantId, id] as const,
  assignments: () => [...personsQueryKeys.all, "assignments"] as const,
  assignmentList: (
    tenantId: string,
    params: Pick<GetPersonAssignmentsParams, "personId" | "on">,
  ) =>
    [
      ...personsQueryKeys.assignments(),
      tenantId,
      params.personId,
      params.on ?? null,
    ] as const,
};
