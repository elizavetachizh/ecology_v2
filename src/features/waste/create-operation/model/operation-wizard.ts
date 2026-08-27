import {
  DEFAULT_UIW_LIST_LIMIT,
  DEFAULT_UNIT_INSTRUCTIONS_LIMIT,
} from "../../../../entities/waste/unit-instruction-waste";
import type { OperationFormValues } from "./operation-form.schema";
import { EMPTY_TYPE_SPECIFIC_VALUES } from "./operation-form.schema";
import { typeSpecificFieldNames } from "./map-operation-form";
import type { UseFormSetValue } from "react-hook-form";

export const UPSERT_OPERATION_STEPS = [
  { id: 1, title: "Дата" },
  { id: 2, title: "Место учёта" },
  { id: 3, title: "Инструкция и отход" },
  { id: 4, title: "Данные операции" },
] as const;

export const UNIT_INSTRUCTION_PARAMS = {
  limit: DEFAULT_UNIT_INSTRUCTIONS_LIMIT,
  offset: 0,
  sort: "name" as const,
  order: "asc" as const,
};

export const UIW_LIST_PARAMS = {
  limit: DEFAULT_UIW_LIST_LIMIT,
  offset: 0,
};

export const STEP_TRIGGER_FIELDS = {
  1: ["date"],
  2: ["unit_id"],
  3: ["waste_id"],
} as const;

export function resetWasteDependentFields(
  setValue: UseFormSetValue<OperationFormValues>,
) {
  setValue("waste_source_id", "");
  setValue("passport_id", "");
  setValue("ttn_id", "");
  setValue("document_kind", "");
}

export function resetTypeSpecificFields(
  setValue: UseFormSetValue<OperationFormValues>,
) {
  for (const name of typeSpecificFieldNames()) {
    setValue(name, EMPTY_TYPE_SPECIFIC_VALUES[name]);
  }
}

export function resetAfterUnitChange(
  setValue: UseFormSetValue<OperationFormValues>,
) {
  setValue("waste_id", "");
  setValue("unit_side_id", "");
  resetWasteDependentFields(setValue);
}
