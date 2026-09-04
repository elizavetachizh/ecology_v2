import { describe, expect, it } from "vitest";
import {
  counterpartyFormSchema,
  sanitizeUnpInput,
} from "./counterparty-form.schema";

const valid = {
  name: "Ромашка",
  full_name: "ООО «Ромашка»",
  unp: "091234567",
  address: "г. Минск",
  contact: "+375 17 000-00-00",
  is_individual: false,
  is_active: true,
};

describe("counterpartyFormSchema", () => {
  it("accepts create with empty optional fields", () => {
    expect(
      counterpartyFormSchema.safeParse({
        name: "Ромашка",
        full_name: "",
        unp: "",
        address: "",
        is_individual: false,
        is_active: true,
      }).success,
    ).toBe(true);
  });

  it("requires name", () => {
    const parsed = counterpartyFormSchema.safeParse({
      ...valid,
      name: "  ",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts UNP of 9 digits and rejects shorter or letters", () => {
    expect(
      counterpartyFormSchema.safeParse({ ...valid, unp: "091234567" }).success,
    ).toBe(true);
    expect(
      counterpartyFormSchema.safeParse({ ...valid, unp: "12345678" }).success,
    ).toBe(false);
    expect(
      counterpartyFormSchema.safeParse({ ...valid, unp: "abc123456" }).success,
    ).toBe(false);
  });
});

describe("sanitizeUnpInput", () => {
  it("keeps only digits and caps at 9", () => {
    expect(sanitizeUnpInput("09-123-4567 extra")).toBe("091234567");
    expect(sanitizeUnpInput("123")).toBe("123");
  });
});
