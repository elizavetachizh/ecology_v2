import type { UserProfile } from "../../../user";
import type { Instruction } from "./instructions.types";

const profile: UserProfile = {
  id: "u1",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
};

export const instructionFixture: Instruction = {
  id: "ins-1",
  tenant_id: "tenant-1",
  name: "Инструкция по утилизации",
  short_name: "ИООС-1",
  start_date: "2026-01-01",
  end_date: null,
  status: "active",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: profile,
  updated_by: profile,
};

export function makeInstruction(
  overrides: Partial<Instruction> = {},
): Instruction {
  return { ...instructionFixture, ...overrides };
}
