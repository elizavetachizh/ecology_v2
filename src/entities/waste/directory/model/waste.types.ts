/** Карточка отхода в справочнике (без привязок и источника) */
export type DirectoryWaste = {
  id: string;
  instructionId: string;
  classifierId: string;
  code: number | null;
  name: string;
  hazardClass: string;
  unit: string;
};

/** Привязка: отход → единица → ПОД-9 → источник образования */
export type WasteBinding = {
  id: string;
  instructionId: string;
  wasteId: string;
  unitId: string;
  pod9Id: string;
  sourceId: string;
};

export type WasteFormValues = {
  classifierId: string;
  code: number | null;
  name: string;
  hazardClass: string;
  unit: string;
};

/** @deprecated alias for POD-9 section form */
export type Pod9WasteFormValues = WasteFormValues;

/** Строка таблицы на карточке ПОД-9 */
export type Pod9Waste = DirectoryWaste & {
  bindingId: string;
  unitId: string;
  pod9Id: string;
  sourceId: string;
  sourceName: string;
};

export const HAZARD_CLASS_OPTIONS = ["I", "II", "III", "IV", "V"] as const;

export const WASTE_UNIT_OPTIONS = ["т", "кг", "м³", "л", "шт"] as const;

export function emptyWasteForm(): WasteFormValues {
  return {
    name: "",
    code: null,
    hazardClass: "IV",
    unit: "т",
    classifierId: "",
  };
}

export const emptyPod9WasteForm = emptyWasteForm;
