import type { UseFormSetValue } from "react-hook-form";
import type { Counterparty } from "../../../../entities/waste/counterparties";
import type { ContractFormValues } from "./contract-form.schema";

export type CounterpartySnapshotSource = Pick<
  Counterparty,
  "address" | "contact"
> | null;

export function counterpartySnapshotFields(item: CounterpartySnapshotSource) {
  return {
    counterparty_address: item?.address ?? "",
    counterparty_contact: item?.contact ?? "",
  };
}

export function applyCounterpartySnapshot(
  setValue: UseFormSetValue<ContractFormValues>,
  item: CounterpartySnapshotSource,
) {
  const snapshot = counterpartySnapshotFields(item);
  setValue("counterparty_address", snapshot.counterparty_address);
  setValue("counterparty_contact", snapshot.counterparty_contact);
}
