import type { UserProfile } from "../../../user";
import type { Person, PersonBrief } from "./persons.types";

export const userProfileFixture: UserProfile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
  last_seen_at: null,
};

export const personFixture: Person = {
  id: "person-1",
  tenant_id: "tenant-1",
  name: "Иванов Иван Иванович",
  first_name: "Иван",
  last_name: "Иванов",
  middle_name: "Иванович",
  beltopgas_uuid: "11111111-1111-1111-1111-111111111111",
  user_id: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  user: null,
  units: [],
  unit_ids: [],
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};

export const personBriefFixture: PersonBrief = {
  id: personFixture.id,
  name: personFixture.name,
  first_name: personFixture.first_name,
  last_name: personFixture.last_name,
  middle_name: personFixture.middle_name,
};
