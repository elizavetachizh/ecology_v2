import type { CurrentUser } from "./user.types";

export const currentUserFixture: CurrentUser = {
  id: "e1ec68c2-0000-0000-0000-000000000001",
  realm: "mingas",
  uuid: "kc-user-id",
  username: "testuser",
  email: "test@example.com",
  first_name: "Test",
  last_name: "User",
  roles: { Mingas: ["editor"] },
  beltopgas_uuid: "btg-uuid-1",
  issuer: "https://auth.example.com/realms/mingas",
};

export function currentUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return { ...currentUserFixture, ...overrides };
}
