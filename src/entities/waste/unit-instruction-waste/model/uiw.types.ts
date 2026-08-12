import type { UserProfile } from "../../../user";
import type { WasteClassifier } from "../../waste-classifier";
import type { HazardClass, Uom } from "../../wastes";

/** Nested expand MDM waste (без audit / physical_state) */
export type WasteBrief = {
  id: string;
  waste_classifier_id: number;
  waste_classifier: WasteClassifier;
  hazard_class: HazardClass;
  uom: Uom;
};

/** Nested expand источника */
export type WasteSourceBrief = {
  id: string;
  name: string;
};

/** UnitInstructionWasteRead */
export type UnitInstructionWaste = {
  id: string;
  tenant_id: string;
  unit_id: string;
  instruction_id: string;
  waste_id: string;
  waste_source_ids: string[];
  transport_unit: string;
  waste: WasteBrief;
  waste_sources: WasteSourceBrief[];
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type UnitInstructionWasteCreate = {
  waste_id: string;
  waste_source_ids?: string[];
  transport_unit?: string;
};

/** PATCH: omit = не трогать; waste_source_ids[] = полная замена / очистка */
export type UnitInstructionWasteUpdate = {
  waste_id?: string;
  waste_source_ids?: string[];
  transport_unit?: string;
};

export type UnitInstructionWasteListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: UnitInstructionWaste[];
};

export type GetUnitInstructionWastesParams = {
  limit: number;
  offset: number;
};

export type UnitInstructionWasteScope = {
  unitId: string;
  instructionId: string;
};

export const DEFAULT_UIW_LIST_LIMIT = 50;
