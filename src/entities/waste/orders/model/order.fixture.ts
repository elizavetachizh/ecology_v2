import type { UserProfile } from "../../../user";
import type { UnitBrief } from "../../units";
import { personBriefFixture } from "../../persons/model/person.fixture";
import type {
  Order,
  OrderBrief,
  OrderListItem,
  OrderState,
  OrderStateItem,
  PersonAssignments,
  UnitResponsible,
} from "./orders.types";

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

export const orderBriefFixture: OrderBrief = {
  id: "order-1",
  number: "12-ОД",
  date: "2024-01-15",
};

export const orderStateItemFixture: OrderStateItem = {
  id: "item-1",
  tenant_id: "tenant-1",
  order_state_id: "state-1",
  unit_id: orderUnitBriefFixture.id,
  person_id: personBriefFixture.id,
  start_date: "2024-01-15",
  unit: orderUnitBriefFixture,
  person: personBriefFixture,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export const orderStateFixture: OrderState = {
  id: "state-1",
  tenant_id: "tenant-1",
  order_id: "order-1",
  start_date: "2024-01-15",
  items: [orderStateItemFixture],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export const orderListItemFixture: OrderListItem = {
  id: "order-1",
  tenant_id: "tenant-1",
  number: "12-ОД",
  date: "2024-01-15",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export const orderFixture: Order = {
  ...orderListItemFixture,
  states: [orderStateFixture],
};

export const unitResponsibleFixture: UnitResponsible = {
  order: orderBriefFixture,
  state: orderStateFixture,
  item: orderStateItemFixture,
};

export const personAssignmentsFixture: PersonAssignments = {
  items: [unitResponsibleFixture],
};
