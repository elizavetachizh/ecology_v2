import { useQueries } from "@tanstack/react-query";
import {
  DEFAULT_UIW_LIST_LIMIT,
  getUnitInstructionWastes,
  uiwQueryKeys,
} from "../../../../entities/waste/unit-instruction-waste";
import { DEFAULT_STALE_TIME_MS } from "../../../../shared/lib/query-client";
import { pickInstructionIdOwningWaste } from "./pick-preferred-instruction";

const SEED_PARAMS = {
  limit: DEFAULT_UIW_LIST_LIMIT,
  offset: 0,
};

type UseInstructionIdForWasteArgs = {
  tenantId: string | null;
  unitId: string;
  wasteId: string;
  instructions: { id: string; status: string }[];
  enabled: boolean;
};

export function useInstructionIdForWaste({
  tenantId,
  unitId,
  wasteId,
  instructions,
  enabled,
}: UseInstructionIdForWasteArgs) {
  const canFetch =
    enabled &&
    Boolean(tenantId && unitId && wasteId) &&
    instructions.length > 0;

  const queries = useQueries({
    queries: canFetch
      ? instructions.map((item) => ({
          queryKey: uiwQueryKeys.list(
            tenantId ?? "none",
            { unitId, instructionId: item.id },
            SEED_PARAMS,
          ),
          queryFn: ({ signal }: { signal: AbortSignal }) =>
            getUnitInstructionWastes(
              { unitId, instructionId: item.id },
              SEED_PARAMS,
              signal,
            ),
          staleTime: DEFAULT_STALE_TIME_MS,
        }))
      : [],
  });

  const loading = canFetch && queries.some((query) => query.isPending);

  return {
    instructionId:
      canFetch && !loading
        ? pickInstructionIdOwningWaste(
            instructions,
            wasteId,
            new Map(
              instructions.map((item, index) => [
                item.id,
                queries[index]?.data?.items ?? [],
              ]),
            ),
          )
        : undefined,
    loading,
  };
}
