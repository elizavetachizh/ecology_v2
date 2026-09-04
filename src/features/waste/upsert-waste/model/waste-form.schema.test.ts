import { describe, expect, it } from "vitest";
import {
  wasteFormDefaultValues,
  wasteFormSchema,
} from "./waste-form.schema";

const valid = {
  waste_classifier_id: 1,
  hazard_class: "class_4" as const,
  uom: "ton" as const,
  physical_state: "solid" as const,
};

describe("wasteFormSchema", () => {
  it("accepts a filled catalog waste", () => {
    expect(wasteFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects default values until a classifier is chosen", () => {
    expect(wasteFormSchema.safeParse(wasteFormDefaultValues).success).toBe(
      false,
    );
  });

  it("rejects classifier id 0", () => {
    const parsed = wasteFormSchema.safeParse({
      ...valid,
      waste_classifier_id: 0,
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0]?.message).toMatch(/Выберите отход/);
  });

  it("accepts a missing physical state", () => {
    expect(
      wasteFormSchema.safeParse({ ...valid, physical_state: null }).success,
    ).toBe(true);
  });
});
