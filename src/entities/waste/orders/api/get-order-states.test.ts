import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getOrderStates } from "./get-order-states";
import { orderStateFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getOrderStates", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue([orderStateFixture]);
  });

  it("requests states list, tenant-scoped", async () => {
    await expect(getOrderStates("order-1")).resolves.toEqual([
      orderStateFixture,
    ]);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states",
      {
        method: "GET",
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getOrderStates("order-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states",
      {
        method: "GET",
        tenantScoped: true,
        signal,
      },
    );
  });
});
