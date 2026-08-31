import type {
  Standard,
  StandardCreate,
  StandardUpdate,
} from "../../../../entities/waste/standards";
import { UOM_LABEL } from "../../../../entities/waste/wastes";
import {
  emptyStandardWasteRow,
  type StandardFormValues,
} from "./standard-form.schema";

export function toStandardWriteBody(
  values: StandardFormValues,
): StandardCreate {
  return {
    start_date: values.start_date,
    unit_id: values.unit_id,
    wastes: values.wastes
      .filter((item) => item.waste_id)
      .map((item) => ({
        waste_id: item.waste_id,
        amount: item.amount.trim(),
      })),
  };
}

/** PATCH всегда шлёт wastes — полная замена перечня. */
export function toStandardUpdateBody(
  values: StandardFormValues,
): StandardUpdate {
  return toStandardWriteBody(values);
}

export function toStandardFormValues(standard: Standard): StandardFormValues {
  return {
    start_date: standard.start_date,
    unit_id: standard.unit_id,
    wastes: [
      ...standard.wastes.map((item) => ({
        waste_id: item.waste_id,
        amount: item.amount,
        label: `${item.waste.waste_classifier.code} — ${item.waste.waste_classifier.name}`,
        uomLabel: UOM_LABEL[item.waste.uom],
      })),
      { ...emptyStandardWasteRow },
    ],
  };
}
