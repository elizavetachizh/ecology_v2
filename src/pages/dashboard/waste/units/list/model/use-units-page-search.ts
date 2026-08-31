import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type {
  UnitSortField,
  UnitSortOrder,
} from "../../../../../../entities/waste/units";
import {
  sortingFromSearch,
  sortingToSearch,
} from "../../../../../../shared/lib/sorting";
import type { SortingState } from "../../../../../../shared/ui";
import { routes } from "../../../../../../shared/config/routes";

export type UnitsPageSearchPatch = {
  q?: string | undefined;
  sort?: UnitSortField | undefined;
  order?: UnitSortOrder | undefined;
  is_pod9?: boolean | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
};

export function useUnitsPageSearch() {
  const navigate = useNavigate({ from: routes.directories.units.list });
  const search = useSearch({ from: routes.directories.units.list });
  const pod9Only = search.is_pod9 === true;

  const sorting = useMemo(
    () => sortingFromSearch(search.sort ?? "name", search.order ?? "asc"),
    [search.sort, search.order],
  );

  const patchSearch = (patch: UnitsPageSearchPatch) => {
    void navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        if (
          "q" in patch ||
          "sort" in patch ||
          "order" in patch ||
          "is_pod9" in patch
        ) {
          next.offset = patch.offset ?? 0;
        }
        if ("is_pod9" in patch && patch.is_pod9 !== true) {
          next.limit = undefined;
          next.offset = undefined;
        }
        return next;
      },
    });
  };

  const onSortingChange = (next: SortingState) => {
    const { sort, order } = sortingToSearch(next);
    patchSearch({
      sort: (sort as UnitSortField | undefined) ?? undefined,
      order,
    });
  };

  const openCreateUnit = (
    parentId?: string,
    options?: { isPod9?: boolean },
  ) => {
    void navigate({
      to: routes.directories.units.new,
      search: {
        parentId: parentId ?? "",
        isPod9: options?.isPod9 ? true : undefined,
      },
    });
  };

  return {
    search,
    pod9Only,
    sorting,
    focusId: search.focusId ?? null,
    patchSearch,
    onSortingChange,
    openCreateUnit,
  };
}
