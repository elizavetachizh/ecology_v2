import { useQuery } from "@tanstack/react-query";
import { getUnit, unitsQueryKeys } from "../../../../entities/waste/units";
import { territoryFromParent } from "./territory-from-parent";

type UseDefaultParentTerritoryArgs = {
  tenantId: string | null;
  parentId?: string;
  enabled?: boolean;
};

/** Подтягивает родителя для create (?parentId=) и отдаёт territory defaults. */
export function useDefaultParentTerritory({
  tenantId,
  parentId,
  enabled = true,
}: UseDefaultParentTerritoryArgs) {
  const canFetch = Boolean(enabled && tenantId && parentId);

  const query = useQuery({
    queryKey: unitsQueryKeys.detail(tenantId ?? "none", parentId ?? "none"),
    queryFn: ({ signal }) => getUnit(parentId!, signal),
    enabled: canFetch,
  });

  const territory = query.data ? territoryFromParent(query.data) : null;

  return {
    loading: canFetch && query.isLoading,
    territory,
    formKey: `create-${parentId ?? "root"}-${territory?.regionId ?? "no-region"}`,
  };
}
