import type { ExpandedState } from "../../../../../../shared/ui";

export function mergeExpanded(
  prev: ExpandedState,
  ids: Array<string | null | undefined>,
): ExpandedState {
  if (prev === true) return prev;
  const next: Record<string, boolean> = {
    ...(prev as Record<string, boolean>),
  };
  for (const id of ids) {
    if (id) next[id] = true;
  }
  return next;
}
