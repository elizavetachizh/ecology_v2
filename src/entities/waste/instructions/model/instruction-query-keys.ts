import type { GetInstructionsParams } from "../api/get-instructions";

export const instructionsQueryKeys = {
  all: ["instructions"] as const,
  list: (params: GetInstructionsParams) =>
    [...instructionsQueryKeys.all, "list", params] as const,
  lists: () => [...instructionsQueryKeys.all, "list"] as const,
  details: () => [...instructionsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...instructionsQueryKeys.details(), id] as const,
};
