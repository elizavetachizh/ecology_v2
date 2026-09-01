import type {
  Permit,
  PermitCreate,
  PermitUpdate,
} from "../../../../entities/waste/permits";
import { UOM_LABEL, wasteLabel } from "../../../../entities/waste/wastes";
import {
  emptyPermitBurialWasteRow,
  type PermitFormValues,
} from "./permit-form.schema";

function emptyToNull(value: string): string | null {
  return value.trim() || null;
}

export function toPermitWriteBody(values: PermitFormValues): PermitCreate {
  return {
    number: values.number.trim(),
    start_date: values.start_date,
    end_date: emptyToNull(values.end_date),
    status: "active",
    unit_id: values.unit_id,
    burial_wastes: values.burial_wastes
      .filter((item) => item.waste_id)
      .map((item) => ({
        waste_id: item.waste_id,
        amount: item.amount.trim(),
      })),
  };
}

/** PATCH всегда шлёт burial_wastes — полная замена перечня. */
export function toPermitUpdateBody(values: PermitFormValues): PermitUpdate {
  return toPermitWriteBody(values);
}

export function toPermitFormValues(permit: Permit): PermitFormValues {
  return {
    number: permit.number,
    start_date: permit.start_date,
    end_date: permit.end_date ?? "",
    unit_id: permit.unit_id,
    burial_wastes: [
      ...permit.burial_wastes.map((item) => ({
        waste_id: item.waste_id,
        amount: item.amount,
        label: wasteLabel(item.waste),
        uomLabel: UOM_LABEL[item.waste.uom],
      })),
      { ...emptyPermitBurialWasteRow },
    ],
  };
}
