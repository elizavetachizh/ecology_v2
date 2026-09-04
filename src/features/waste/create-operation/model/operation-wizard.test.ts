import { describe, expect, it, vi } from "vitest";
import { resetAfterUnitChange } from "./operation-wizard";

describe("resetAfterUnitChange", () => {
  it("clears instruction, waste, and waste-dependent fields together", () => {
    const setValue = vi.fn();
    resetAfterUnitChange(setValue);

    expect(setValue).toHaveBeenCalledWith("instruction_id", "");
    expect(setValue).toHaveBeenCalledWith("waste_id", "");
    expect(setValue).toHaveBeenCalledWith("unit_side_id", "");
    expect(setValue).toHaveBeenCalledWith("waste_source_id", "");
    expect(setValue).toHaveBeenCalledWith("passport_id", "");
    expect(setValue).toHaveBeenCalledWith("ttn_id", "");
    expect(setValue).toHaveBeenCalledWith("document_kind", "");
  });
});
