import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getCounterparty } from "./get-counterparty";
import { counterpartyFixture } from "../model/counterparty.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getCounterparty", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(counterpartyFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getCounterparty("cp-1")).resolves.toEqual(counterpartyFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties/cp-1",
      {
        method: "GET",
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getCounterparty("cp-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties/cp-1",
      {
        method: "GET",
        tenantScoped: true,
        signal,
      },
    );
  });
});
