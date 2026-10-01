import { useEffect, useRef } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import {
  counterpartiesQueryKeys,
  getCounterparty,
} from "../../../../entities/waste/counterparties";
import { applyCounterpartySnapshot } from "./counterparty-snapshot";
import type { ContractFormValues } from "./contract-form.schema";

type UsePrefillCounterpartyArgs = {
  enabled: boolean;
  counterpartyId?: string;
  tenantId: string | null;
  getValues: UseFormGetValues<ContractFormValues>;
  setValue: UseFormSetValue<ContractFormValues>;
};

/** При создании из карточки контрагента один раз копирует адрес и контакты. */
export function usePrefillCounterparty({
  enabled,
  counterpartyId,
  tenantId,
  getValues,
  setValue,
}: UsePrefillCounterpartyArgs) {
  const prefillCounterparty = useQuery({
    queryKey: counterpartiesQueryKeys.detail(
      tenantId ?? "none",
      counterpartyId || "none",
    ),
    queryFn: ({ signal }) => getCounterparty(counterpartyId!, signal),
    enabled: Boolean(enabled && tenantId && counterpartyId),
  });
  const appliedPrefillId = useRef<string | null>(null);

  useEffect(() => {
    const item = prefillCounterparty.data;
    if (!item) return;
    if (appliedPrefillId.current === item.id) return;
    if (getValues("counterparty_id") !== item.id) return;
    appliedPrefillId.current = item.id;
    applyCounterpartySnapshot(setValue, item);
  }, [prefillCounterparty.data, getValues, setValue]);
}
