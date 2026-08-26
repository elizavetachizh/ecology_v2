import { describe, expect, it } from "vitest";
import { toInstructionWriteBody } from "./map-instruction-form";

describe("toInstructionWriteBody", () => {
  it("sends status and nulls empty short_name", () => {
    expect(
      toInstructionWriteBody({
        name: " Инструкция ",
        short_name: "  ",
        start_date: "2026-01-01",
        end_date: "2026-12-31",
        status: "active",
      }),
    ).toEqual({
      name: "Инструкция",
      short_name: null,
      start_date: "2026-01-01",
      end_date: "2026-12-31",
      status: "active",
    });
  });
});
