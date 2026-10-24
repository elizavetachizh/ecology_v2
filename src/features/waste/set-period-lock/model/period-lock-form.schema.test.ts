import { describe, expect, it } from "vitest";
import { periodLockFormSchema } from "./period-lock-form.schema";

describe("periodLockFormSchema", () => {
  it("accepts an ISO lock date", () => {
    const parsed = periodLockFormSchema.safeParse({ lock_date: "2026-01-31" });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.lock_date).toBe("2026-01-31");
  });

  it("rejects an empty date so save does not send a missing field", () => {
    const parsed = periodLockFormSchema.safeParse({ lock_date: "" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0]?.message).toBe(
      "Укажите последний закрытый день",
    );
  });

  it("rejects a date that is not ISO", () => {
    const parsed = periodLockFormSchema.safeParse({ lock_date: "31.01.2026" });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(parsed.error.issues[0]?.message).toBe("Дата в формате ГГГГ-ММ-ДД");
  });
});
