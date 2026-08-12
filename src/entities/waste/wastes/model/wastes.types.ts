import type { UserProfile } from "../../../user";
import type { WasteClassifier } from "../../waste-classifier";

/** API keys — hazard_class (mdm_wastes.md) */
export const HAZARD_CLASS_LABEL = {
  unclassified: "Не классифицирован",
  class_1: "1 класс опасности",
  class_2: "2 класс опасности",
  class_3: "3 класс опасности",
  class_4: "4 класс опасности",
  undangerous: "Неопасный",
} as const;

export const UOM_LABEL = {
  kg: "кг",
  ton: "т",
  pcs: "шт",
} as const;

export const PHYSICAL_STATE_LABEL = {
  solid: "Твёрдое",
  liquid: "Жидкое",
} as const;

export type HazardClass = keyof typeof HAZARD_CLASS_LABEL;
export type Uom = keyof typeof UOM_LABEL;
export type PhysicalState = keyof typeof PHYSICAL_STATE_LABEL;

export const HazardClassValues = Object.keys(HAZARD_CLASS_LABEL) as [
  HazardClass,
  ...HazardClass[],
];
export const UomValues = Object.keys(UOM_LABEL) as [Uom, ...Uom[]];
export const PhysicalStateValues = Object.keys(PHYSICAL_STATE_LABEL) as [
  PhysicalState,
  ...PhysicalState[],
];

export type Waste = {
  id: string;
  tenant_id: string;
  waste_classifier_id: number;
  waste_classifier: WasteClassifier;
  hazard_class: HazardClass;
  uom: Uom;
  physical_state: PhysicalState | null;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type WasteCreate = {
  waste_classifier_id: number;
  hazard_class?: HazardClass;
  uom?: Uom;
  physical_state?: PhysicalState | null;
};

export type WasteUpdate = {
  waste_classifier_id?: number;
  hazard_class?: HazardClass;
  uom?: Uom;
  physical_state?: PhysicalState | null;
};

export type WasteListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Waste[];
};

export const WasteSortFields = [
  "code",
  "name",
  "hazard_class",
  "physical_state",
  "uom",
  "created_at",
  "id",
] as const;

export type WasteSortField = (typeof WasteSortFields)[number];
export type WasteSortOrder = "asc" | "desc";

export type GetWastesParams = {
  search?: string;
  hazard_class?: HazardClass;
  physical_state?: PhysicalState;
  limit: number;
  offset: number;
  order?: WasteSortOrder;
  sort?: WasteSortField;
};

export const DEFAULT_WASTES_LIST_LIMIT = 50;
export const DEFAULT_WASTES_OPTIONS_LIMIT = 20;
