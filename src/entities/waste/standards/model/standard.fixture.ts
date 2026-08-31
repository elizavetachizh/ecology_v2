import type { UserProfile } from "../../../user";
import type { Standard, StandardWaste } from "./standards.types";

const profile: UserProfile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

export const standardWasteFixture: StandardWaste = {
  id: "sw-1",
  tenant_id: "tenant-1",
  standard_id: "standard-1",
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

export const standardFixture: Standard = {
  id: "standard-1",
  tenant_id: "tenant-1",
  start_date: "2026-01-15",
  status: "active",
  unit_id: "unit-1",
  unit: { id: "unit-1", name: "Цех №1", short_name: "Ц1" },
  wastes: [standardWasteFixture],
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export function makeStandard(overrides: Partial<Standard> = {}): Standard {
  return { ...standardFixture, ...overrides };
}
