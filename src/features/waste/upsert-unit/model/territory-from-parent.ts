import type { Unit } from "../../../../entities/waste/units";

export type TerritoryLabels = {
  region?: string;
  district?: string;
};

export type ParentTerritory = {
  regionId: number | undefined;
  districtId: number | undefined;
  labels: TerritoryLabels;
};

export function territoryFromParent(parent: Unit): ParentTerritory {
  return {
    regionId: parent.region?.id,
    districtId: parent.district?.id,
    labels: {
      region: parent.region?.name,
      district: parent.district?.name,
    },
  };
}
