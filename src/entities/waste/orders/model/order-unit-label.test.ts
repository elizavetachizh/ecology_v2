import { describe, expect, it } from "vitest";
import { orderUnitBriefFixture } from "./order.fixture";
import { ORDER_TENANT_WIDE_UNIT_LABEL, orderUnitLabel } from "./orders.types";

describe("orderUnitLabel", () => {
  it("uses short_name when present", () => {
    expect(orderUnitLabel(orderUnitBriefFixture)).toBe("Ц1");
  });

  it("falls back to name", () => {
    expect(
      orderUnitLabel({ ...orderUnitBriefFixture, short_name: null }),
    ).toBe("Цех №1");
  });

  it("labels tenant-wide orders", () => {
    expect(orderUnitLabel(null)).toBe(ORDER_TENANT_WIDE_UNIT_LABEL);
    expect(orderUnitLabel(undefined)).toBe(ORDER_TENANT_WIDE_UNIT_LABEL);
  });
});
