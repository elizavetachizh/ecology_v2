import type { UserProfile } from "../../../user";
import type { UnitBrief } from "../../units";
import type { Order } from "./orders.types";

const profile: UserProfile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

export const orderUnitBriefFixture: UnitBrief = {
  id: "unit-1",
  name: "Цех №1",
  short_name: "Ц1",
};

export const orderFixture: Order = {
  id: "order-1",
  tenant_id: "tenant-1",
  number: "12-ОД",
  start_date: "2024-01-15",
  status: "active",
  unit_id: orderUnitBriefFixture.id,
  unit: orderUnitBriefFixture,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return { ...orderFixture, ...overrides };
}
