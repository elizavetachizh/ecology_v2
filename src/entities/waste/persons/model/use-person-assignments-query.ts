import { useQuery } from "@tanstack/react-query";
import { getPersonAssignments } from "../api/get-person-assignments";
import { personsQueryKeys } from "./persons-query-keys";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";

type UsePersonAssignmentsQueryArgs = {
  tenantId: string | null;
  personId?: string;
  on?: string;
  enabled?: boolean;
};

export function usePersonAssignmentsQuery({
  tenantId,
  personId,
  on,
  enabled = true,
}: UsePersonAssignmentsQueryArgs) {
  const canFetch = Boolean(tenantId && personId) && enabled;

  const query = useQuery({
    queryKey: personsQueryKeys.assignmentList(tenantId ?? "none", {
      personId: personId ?? "",
      on,
    }),
    queryFn: ({ signal }) =>
      getPersonAssignments({ personId: personId!, on }, signal),
    enabled: canFetch,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  return {
    items: query.data?.items ?? [],
    loading: canFetch && query.isLoading,
    fetching: canFetch && query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
