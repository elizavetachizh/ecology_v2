import type { UserProfile } from "../../../user";
import type { Permit, PermitBurialWaste } from "./permits.types";

const profile: UserProfile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

export const permitBurialWasteFixture: PermitBurialWaste = {
  id: "pbw-1",
  tenant_id: "tenant-1",
  permit_id: "permit-1",
  waste_id: "waste-1",
  waste: {
    id: "waste-1",
    waste_classifier_id: 1,
    waste_classifier: { id: 1, code: 12345678901, name: "Отход тестовый" },
    hazard_class: "class_4",
    uom: "ton",
  },
  amount: "12.500000",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export const permitFixture: Permit = {
  id: "permit-1",
  tenant_id: "tenant-1",
  number: "Р-001",
  start_date: "2026-01-15",
  end_date: "2026-12-31",
  status: "active",
  unit_id: "unit-1",
  unit: { id: "unit-1", name: "Цех №1", short_name: "Ц1" },
  burial_wastes: [permitBurialWasteFixture],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export function makePermit(overrides: Partial<Permit> = {}): Permit {
  return { ...permitFixture, ...overrides };
}
