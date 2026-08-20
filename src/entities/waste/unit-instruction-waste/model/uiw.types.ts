import type { UserProfile } from "../../../user";
import type {
  InstructionBrief,
  InstructionSortField,
  InstructionSortOrder,
} from "../../instructions";
import type { UnitBrief } from "../../units";
import type { WasteSourceBrief } from "../../waste-sources";
import type { WasteBrief } from "../../wastes";

/** UnitInstructionWasteRead */
export type UnitInstructionWaste = {
  id: string;
  tenant_id: string;
  unit_id: string;
  unit: UnitBrief;
  instruction_id: string;
  instruction: InstructionBrief;
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
export type UnitInstructionWasteUpdate = Partial<UnitInstructionWasteCreate>;

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

/** GET /mdm/units/{unit_id}/instructions — distinct instructions that already have UIW */
export type GetUnitInstructionsParams = {
  limit: number;
  offset: number;
  sort?: InstructionSortField;
  order?: InstructionSortOrder;
};

export type UnitInstructionListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: InstructionBrief[];
};

export const DEFAULT_UNIT_INSTRUCTIONS_LIMIT = 50;

export type UnitInstructionWasteScope = {
  unitId: string;
  instructionId: string;
};

export const DEFAULT_UIW_LIST_LIMIT = 50;
