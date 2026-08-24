import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getUnitResponsible } from "./get-unit-responsible";
import { unitResponsibleFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getUnitResponsible", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(unitResponsibleFixture);
  });

  it("requests as-of responsible without on (backend default today UTC)", async () => {
    await expect(getUnitResponsible({ unitId: "unit-1" })).resolves.toEqual(
      unitResponsibleFixture,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/units/unit-1/responsible",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes on date when provided", async () => {
    await getUnitResponsible({ unitId: "unit-1", on: "2024-06-01" });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/units/unit-1/responsible?on=2024-06-01",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getUnitResponsible({ unitId: "unit-1" }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/units/unit-1/responsible",
      { signal, tenantScoped: true },
    );
  });
});
