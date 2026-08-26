import { DEFAULT_INSTRUCTIONS_LIST_LIMIT } from "./instructions.types";
import { useActiveInstructionId } from "./use-active-instruction-id";
import { useInstructionsListQuery } from "./use-instructions-list-query";

const bindingsTabsListParams = {
  sort: "name" as const,
  order: "asc" as const,
  limit: DEFAULT_INSTRUCTIONS_LIST_LIMIT,
  offset: 0,
};

type UseInstructionBindingsTabsParams = {
  tenantId: string | null;
  instructionId?: string;
  onInstructionChange: (instructionId: string | undefined) => void;
};

/** Список инструкций для вкладок на карточке UIW/WIU + выбранный id. */
export function useInstructionBindingsTabs({
  tenantId,
  instructionId,
  onInstructionChange,
}: UseInstructionBindingsTabsParams) {
  const query = useInstructionsListQuery({
    tenantId,
    params: bindingsTabsListParams,
  });
  const activeInstructionId = useActiveInstructionId({
    instructionId,
    instructions: query.items,
    onInstructionChange,
  });

  return {
    activeInstructionId,
    instructions: query.items,
    loading: query.loading,
    error: query.error,
  };
}
