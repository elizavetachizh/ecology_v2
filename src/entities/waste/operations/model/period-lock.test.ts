import { describe, expect, it } from "vitest";
import { isOperationDateLocked } from "./period-lock";

describe("isOperationDateLocked", () => {
  it("is false when the period is open", () => {
    expect(isOperationDateLocked("2026-03-01", null)).toBe(false);
    expect(isOperationDateLocked("2026-03-01", "")).toBe(false);
  });

  it("locks the lock date and every earlier day", () => {
    expect(isOperationDateLocked("2026-03-01", "2026-03-01")).toBe(true);
    expect(isOperationDateLocked("2026-02-28", "2026-03-01")).toBe(true);
    expect(isOperationDateLocked("2026-03-02", "2026-03-01")).toBe(false);
  });
});
