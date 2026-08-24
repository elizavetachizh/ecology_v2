import type { UserProfile } from "../../../user";
import type { Passport } from "./passports.types";

const profile: UserProfile = {
  id: "99999999-9999-4999-8999-999999999999",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

export const passportFixture: Passport = {
  id: "22222222-2222-4222-8222-222222222222",
  tenant_id: "11111111-1111-4111-8111-111111111111",
  number: "СП-001",
  date: "2026-03-15",
  unit_id: "33333333-3333-4333-8333-333333333333",
  unit: { id: "33333333-3333-4333-8333-333333333333", name: "Цех №1", short_name: "Ц1" },
  recycling_contract_id: "44444444-4444-4444-8444-444444444444",
  recycling_contract: {
    id: "44444444-4444-4444-8444-444444444444",
    number: "Д-П-01",
    contract_type: "recycling",
    status: "active",
    counterparty: { id: "88888888-8888-4888-8888-888888888888", name: "Ромашка" },
  },
  transport_type: "self",
  transport_contract_id: null,
  transport_contract: null,
  status: "active",
  waste_producer_id: null,
  waste_producer: null,
  wastes: [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      tenant_id: "11111111-1111-4111-8111-111111111111",
      passport_id: "22222222-2222-4222-8222-222222222222",
      waste_id: "77777777-7777-4777-8777-777777777777",
      waste: {
        id: "77777777-7777-4777-8777-777777777777",
        waste_classifier_id: 1,
        waste_classifier: { id: 1, code: 12345678901, name: "Отход тестовый" },
        hazard_class: "class_4",
        uom: "kg",
      },
      created_at: "2026-03-15T00:00:00Z",
      updated_at: "2026-03-15T00:00:00Z",
      created_by: profile,
      updated_by: profile,
    },
  ],
  created_at: "2026-03-15T00:00:00Z",
  updated_at: "2026-03-15T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export function makePassport(overrides: Partial<Passport> = {}): Passport {
  return { ...passportFixture, ...overrides };
}
