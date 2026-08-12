import type { WasteCreate } from "../../../../entities/waste/wastes";
import type { WasteFormValues } from "./waste-form.schema";

export function toWasteWriteBody(values: WasteFormValues): WasteCreate {
  return {
    waste_classifier_id: values.waste_classifier_id,
    hazard_class: values.hazard_class,
    uom: values.uom,
    physical_state: values.physical_state,
  };
}
