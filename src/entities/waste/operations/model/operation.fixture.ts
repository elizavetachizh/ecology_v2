import type { UserProfile } from "../../../user";
import type { Balance, BalanceCurrent, Operation } from "./operations.types";

const profile: UserProfile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

export const operationFixture: Operation = {
  id: "op-1",
  tenant_id: "tenant-1",
  date: "2026-03-01",
  operation_type: "formed",
  status: "confirmed",
  linked_operation_id: null,
  unit_id: "unit-1",
  unit: { id: "unit-1", name: "Цех №1", short_name: "Ц1" },
  unit_side_id: null,
  unit_side: null,
  waste_id: "waste-1",
  waste: {
    id: "waste-1",
    waste_classifier_id: 1,
    waste_classifier: { id: 1, code: 12345678901, name: "Отход тестовый" },
    hazard_class: "class_4",
    uom: "kg",
  },
  waste_source_id: "ws-1",
  waste_source: { id: "ws-1", name: "Цех №3" },
  use_purpose: null,
  neutralization_method: null,
  transfer_receipt_purpose: null,
  counterparty_id: null,
  counterparty: null,
  passport_id: null,
  passport: null,
  ttn_id: null,
  ttn: null,
  amount: "10.000000",
  balance: {
    id: "bal-1",
    date: "2026-03-01",
    amount: "10.000000",
    operation_id: "op-1",
  },
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export const balanceFixture: Balance = {
  id: "bal-1",
  tenant_id: "tenant-1",
  date: "2026-03-01",
  unit: operationFixture.unit,
  waste: operationFixture.waste,
  amount: "10.000000",
};

export const currentBalanceFixture: BalanceCurrent = {
  unit_id: "unit-1",
  waste_id: "waste-1",
  amount: "10.000000",
};

export function makeOperation(overrides: Partial<Operation> = {}): Operation {
  return { ...operationFixture, ...overrides };
}
