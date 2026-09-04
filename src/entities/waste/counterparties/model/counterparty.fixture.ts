import type { UserProfile } from "../../../user";
import type { Counterparty } from "./counterparties.types";

const profile: UserProfile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

export const counterpartyFixture: Counterparty = {
  id: "cp-1",
  tenant_id: "tenant-1",
  name: "Ромашка",
  full_name: "ООО «Ромашка»",
  unp: "091234567",
  address: "г. Минск, ул. Ленина, 1",
  contact: "+375 17 000-00-00",
  is_active: true,
  is_individual: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};
