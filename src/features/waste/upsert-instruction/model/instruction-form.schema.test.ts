import { describe, expect, it } from "vitest";
import {
  instructionActivateSchema,
  instructionFormSchema,
} from "./instruction-form.schema";

const draft = {
  name: "Инструкция",
  short_name: "",
  start_date: "",
  end_date: "",
};

describe("instructionFormSchema", () => {
  it("accepts a nameless-dates draft", () => {
    expect(instructionFormSchema.safeParse(draft).success).toBe(true);
  });

  it("rejects inverted date range", () => {
    const parsed = instructionFormSchema.safeParse({
      ...draft,
      start_date: "2026-12-31",
      end_date: "2026-01-01",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("instructionActivateSchema", () => {
  it("requires both dates", () => {
    const parsed = instructionActivateSchema.safeParse(draft);
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const paths = parsed.error.issues.map((issue) => issue.path[0]);
    expect(paths).toContain("start_date");
    expect(paths).toContain("end_date");
  });

  it("accepts a full period", () => {
    expect(
      instructionActivateSchema.safeParse({
        ...draft,
        start_date: "2026-01-01",
        end_date: "2026-12-31",
      }).success,
    ).toBe(true);
  });
});

describe("instructionActivateSchema messages", () => {
  it("uses action copy, not generic required", () => {
    const parsed = instructionActivateSchema.safeParse(draft);
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues.some((issue) => /ввести в действие/i.test(issue.message))).toBe(
      true,
    );
  });
});
