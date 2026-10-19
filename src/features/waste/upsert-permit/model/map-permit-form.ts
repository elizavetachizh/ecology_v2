import type {
  Permit,
  PermitCreate,
  PermitLimitWaste,
  PermitLimitWasteWrite,
  PermitUpdate,
} from "../../../../entities/waste/permits";
import { UOM_LABEL, wasteLabel } from "../../../../entities/waste/wastes";
import {
  emptyPermitLimitWasteRow,
  type PermitFormLimitWaste,
  type PermitFormValues,
} from "./permit-form.schema";

function emptyToNull(value: string | null): string | null {
  return value?.trim() || null;
}

function toLimitWriteRows(
  rows: PermitFormLimitWaste[],
): PermitLimitWasteWrite[] {
  return rows
    .filter((item) => item.waste_id)
    .map((item) => ({
      waste_id: item.waste_id,
      amount: item.amount.trim(),
    }));
}

function toLimitFormRows(
  items: PermitLimitWaste[] | null | undefined,
): PermitFormLimitWaste[] {
  return [
    ...(items ?? []).map((item) => ({
      waste_id: item.waste_id,
      amount: item.amount,
      label: wasteLabel(item.waste),
      uomLabel: UOM_LABEL[item.waste.uom],
    })),
    { ...emptyPermitLimitWasteRow },
  ];
}

export function toPermitWriteBody(values: PermitFormValues): PermitCreate {
  return {
    number: values.number.trim(),
    start_date: values.start_date,
    end_date: emptyToNull(values.end_date),
    status: "active",
    unit_id: values.unit_id ? values.unit_id : null,
    burial_wastes: toLimitWriteRows(values.burial_wastes),
    storage_wastes: toLimitWriteRows(values.storage_wastes),
  };
}

/** PATCH всегда шлёт обе коллекции — полная замена каждого перечня. */
export function toPermitUpdateBody(values: PermitFormValues): PermitUpdate {
  return toPermitWriteBody(values);
}

export function toPermitFormValues(permit: Permit): PermitFormValues {
  return {
    number: permit.number,
    start_date: permit.start_date,
    end_date: permit.end_date ?? "",
    unit_id: permit.unit_id ?? "",
    burial_wastes: toLimitFormRows(permit.burial_wastes),
    storage_wastes: toLimitFormRows(permit.storage_wastes),
  };
}
