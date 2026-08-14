import type { UserProfile } from "../../../user";
import type { InstructionBrief } from "../../instructions";
import type { UnitBrief } from "../../units";
import type { WasteSourceBrief } from "../../waste-sources";
import type { WasteBrief } from "../../wastes";

export type WasteInstructionUnit = {
  id: string;
  tenant_id: string;
  unit_id: string;
  unit: UnitBrief;
  instruction_id: string;
  instruction: InstructionBrief;
  waste_id: string;
  waste: WasteBrief;
  waste_source_ids: string[];
  waste_sources: WasteSourceBrief[];
  transport_unit: string;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};
export type WasteInstructionUnitCreate = {
  unit_id: string;
  waste_source_ids?: string[];
  transport_unit?: string;
};
