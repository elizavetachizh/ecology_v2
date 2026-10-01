import { describe, expect, it } from "vitest";
import { personFormSchema } from "./person-form.schema";

const valid = {
  name: "Иванов И. И.",
  first_name: "",
  last_name: "",
  middle_name: "",
  beltopgas_uuid: "",
  unit_ids: [] as string[],
};

describe("personFormSchema", () => {
  it("accepts empty FIO and beltopgas", () => {
    expect(personFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a blank name and a name longer than 255", () => {
    expect(personFormSchema.safeParse({ ...valid, name: "   " }).success).toBe(
      false,
    );
    expect(
      personFormSchema.safeParse({ ...valid, name: "а".repeat(255) }).success,
    ).toBe(true);
    expect(
      personFormSchema.safeParse({ ...valid, name: "а".repeat(256) }).success,
    ).toBe(false);
  });

  it("rejects FIO longer than 255", () => {
    expect(
      personFormSchema.safeParse({ ...valid, last_name: "а".repeat(256) })
        .success,
    ).toBe(false);
  });

  it("rejects beltopgas_uuid longer than 50", () => {
    expect(
      personFormSchema.safeParse({
        ...valid,
        beltopgas_uuid: "a".repeat(50),
      }).success,
    ).toBe(true);
    expect(
      personFormSchema.safeParse({
        ...valid,
        beltopgas_uuid: "a".repeat(51),
      }).success,
    ).toBe(false);
  });
});
