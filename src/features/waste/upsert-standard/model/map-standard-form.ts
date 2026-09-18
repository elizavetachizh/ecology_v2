import {
  standardUnitLabel,
  type Standard,
  type StandardCreate,
  type StandardUpdate,
} from "../../../../entities/waste/standards";
import { UOM_LABEL, wasteLabel } from "../../../../entities/waste/wastes";
import {
  emptyStandardWasteRow,
  type StandardFormValues,
} from "./standard-form.schema";

export function toStandardWriteBody(
  values: StandardFormValues,
): StandardCreate {
  return {
    start_date: values.start_date,
    units: values.units.map((unit) => ({
      unit_id: unit.unit_id,
      wastes: unit.wastes
        .filter((item) => item.waste_id)
        .map((item) => ({
          waste_id: item.waste_id,
          amount: item.amount.trim(),
        })),
    })),
  };
}

/** PATCH всегда шлёт units — полная замена дерева. */
export function toStandardUpdateBody(
  values: StandardFormValues,
): StandardUpdate {
  return toStandardWriteBody(values);
}

export function toStandardFormValues(standard: Standard): StandardFormValues {
  return {
    start_date: standard.start_date,
    units: standard.units.map((unit) => ({
      unit_id: unit.unit_id,
      unit_label: standardUnitLabel(unit.unit),
      wastes: [
        ...unit.wastes.map((item) => ({
          waste_id: item.waste_id,
          amount: item.amount,
          label: wasteLabel(item.waste),
          uomLabel: UOM_LABEL[item.waste.uom],
        })),
        { ...emptyStandardWasteRow },
      ],
    })),
  };
}
