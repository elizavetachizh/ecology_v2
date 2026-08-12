import type {
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";

/** URL/API `sort`+`order` → TanStack SortingState (одна колонка). */
export function sortingFromSearch(
  sort?: string,
  order?: "asc" | "desc",
): SortingState {
  if (!sort) return [];
  return [{ id: sort, desc: order === "desc" }];
}

/** SortingState → URL/API `sort`+`order`. */
export function sortingToSearch(sorting: SortingState): {
  sort: string | undefined;
  order: "asc" | "desc" | undefined;
} {
  const first = sorting[0];
  if (!first) {
    return { sort: undefined, order: undefined };
  }
  return {
    sort: first.id,
    order: first.desc ? "desc" : "asc",
  };
}

export type { OnChangeFn, SortingState };
