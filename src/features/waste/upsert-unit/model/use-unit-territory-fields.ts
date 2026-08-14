import { useRef, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { Unit } from "../../../../entities/waste/units";
import type { UnitFormValues } from "./unit-form.schema";
import {
  territoryFromParent,
  type TerritoryLabels,
} from "./territory-from-parent";

type UseUnitTerritoryFieldsArgs = {
  setValue: UseFormSetValue<UnitFormValues>;
  defaultParentId?: string;
  initialLabels?: TerritoryLabels;
};

/** Labels + наследование region/district от родителя. */
export function useUnitTerritoryFields({
  setValue,
  defaultParentId,
  initialLabels,
}: UseUnitTerritoryFieldsArgs) {
  const [labels, setLabels] = useState<TerritoryLabels>(
    () => initialLabels ?? {},
  );
  const lastInheritedParentIdRef = useRef<string | null>(
    defaultParentId ?? null,
  );

  const inheritFromParent = (parent: Unit | null) => {
    if (!parent) {
      lastInheritedParentIdRef.current = null;
      return;
    }
    if (lastInheritedParentIdRef.current === parent.id) return;
    lastInheritedParentIdRef.current = parent.id;

    const next = territoryFromParent(parent);
    setValue("region_id", next.regionId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("district_id", next.districtId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setLabels(next.labels);
  };

  const onRegionChange = (region: { id: number; name: string } | null) => {
    setValue("district_id", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setLabels({
      region: region?.name,
      district: undefined,
    });
  };

  const onDistrictChange = (district: { id: number; name: string } | null) => {
    setLabels((prev) => ({
      ...prev,
      district: district?.name,
    }));
  };

  return {
    labels,
    inheritFromParent,
    onRegionChange,
    onDistrictChange,
  };
}
