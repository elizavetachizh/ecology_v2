import { describe, expect, it } from "vitest";
import { instructionFormSchema } from "./instruction-form.schema";

const named = {
  name: "Инструкция",
  short_name: "",
  start_date: "",
  end_date: "",
};

describe("instructionFormSchema", () => {
  it("defaults-shaped active without dates fails", () => {
    const parsed = instructionFormSchema.safeParse({
      ...named,
      status: "active",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const paths = parsed.error.issues.map((issue) => issue.path[0]);
    expect(paths).toContain("start_date");
    expect(paths).toContain("end_date");
  });

  it("accepts active with a full period", () => {
    expect(
      instructionFormSchema.safeParse({
        ...named,
        start_date: "2026-01-01",
        end_date: "2026-12-31",
        status: "active",
      }).success,
    ).toBe(true);
  });

  it("accepts a draft without dates", () => {
    expect(
      instructionFormSchema.safeParse({
        ...named,
        status: "draft",
      }).success,
    ).toBe(true);
  });

  it("rejects inverted date range", () => {
    const parsed = instructionFormSchema.safeParse({
      ...named,
      start_date: "2026-12-31",
      end_date: "2026-01-01",
      status: "draft",
    });
    expect(parsed.success).toBe(false);
  });

  it("uses status copy when active dates are missing", () => {
    const parsed = instructionFormSchema.safeParse({
      ...named,
      status: "active",
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(
      parsed.error.issues.some((issue) => issue.message.includes("Действует")),
    ).toBe(true);
  });
});
