import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getCurrentBalance } from "./get-current-balance";
import { currentBalanceFixture } from "../model/operation.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getCurrentBalance", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(currentBalanceFixture);
  });

  it("requests current balance by unit and waste, tenant-scoped", async () => {
    await expect(
      getCurrentBalance({ unit_id: "unit-1", waste_id: "waste-1" }),
    ).resolves.toEqual(currentBalanceFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/operations/balances/current?unit_id=unit-1&waste_id=waste-1",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getCurrentBalance({ unit_id: "unit-1", waste_id: "waste-1" }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/operations/balances/current?unit_id=unit-1&waste_id=waste-1",
      { signal, tenantScoped: true },
    );
  });
});
