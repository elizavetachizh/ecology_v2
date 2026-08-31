import { describe, expect, it } from "vitest";
import { toOperationUpdateBody } from "./map-edit-operation-form";

const values = {
  date: "2026-04-02",
  amount: "3.5",
  waste_source_id: "ws-2",
};

describe("toOperationUpdateBody", () => {
  it("sends date, amount and waste_source_id for formed", () => {
    expect(toOperationUpdateBody(values, "formed")).toEqual({
      date: "2026-04-02",
      amount: "3.5",
      waste_source_id: "ws-2",
    });
  });

  it("omits waste_source_id for other types", () => {
    expect(toOperationUpdateBody(values, "used")).toEqual({
      date: "2026-04-02",
      amount: "3.5",
    });
  });
});
