import { describe, expect, it } from "vitest";
import {
  bindUiwFormDefaultValues,
  bindUiwFormSchema,
} from "./bind-uiw-form.schema";

const wasteId = "550e8400-e29b-41d4-a716-446655440000";
const sourceId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

const valid = {
  waste_id: wasteId,
  waste_source_ids: [] as string[],
  transport_unit: "0",
};

describe("bindUiwFormSchema", () => {
  it("accepts a binding with empty sources and default transport unit", () => {
    expect(bindUiwFormSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts several source uuids", () => {
    expect(
      bindUiwFormSchema.safeParse({
        ...valid,
        waste_source_ids: [sourceId, "6ba7b810-9dad-41d1-80b4-00c04fd430c9"],
        transport_unit: "12.5",
      }).success,
    ).toBe(true);
  });

  it("rejects default values until a waste is chosen", () => {
    expect(bindUiwFormSchema.safeParse(bindUiwFormDefaultValues).success).toBe(
      false,
    );
  });

  it("rejects a missing waste", () => {
    const parsed = bindUiwFormSchema.safeParse({ ...valid, waste_id: "" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0]?.message).toMatch(/Выберите отход/);
  });

  it("rejects a non-uuid source id", () => {
    expect(
      bindUiwFormSchema.safeParse({
        ...valid,
        waste_source_ids: ["not-a-uuid"],
      }).success,
    ).toBe(false);
  });

  it("rejects an empty transport unit", () => {
    expect(
      bindUiwFormSchema.safeParse({ ...valid, transport_unit: "  " }).success,
    ).toBe(false);
  });

  it("rejects more than 6 decimal places", () => {
    expect(
      bindUiwFormSchema.safeParse({
        ...valid,
        transport_unit: "1.1234567",
      }).success,
    ).toBe(false);
  });

  it("rejects a value above 999999.999999", () => {
    expect(
      bindUiwFormSchema.safeParse({
        ...valid,
        transport_unit: "1000000",
      }).success,
    ).toBe(false);
  });

  it("accepts the upper bound", () => {
    expect(
      bindUiwFormSchema.safeParse({
        ...valid,
        transport_unit: "999999.999999",
      }).success,
    ).toBe(true);
  });
});
