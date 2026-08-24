import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getOrderState } from "./get-order-state";
import { orderStateFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getOrderState", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(orderStateFixture);
  });

  it("requests state by id, tenant-scoped", async () => {
    await expect(getOrderState("order-1", "state-1")).resolves.toEqual(
      orderStateFixture,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states/state-1",
      {
        method: "GET",
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getOrderState("order-1", "state-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states/state-1",
      {
        method: "GET",
        tenantScoped: true,
        signal,
      },
    );
  });
});
