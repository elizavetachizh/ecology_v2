import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getOrder } from "./get-order";
import { orderFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getOrder", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(orderFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getOrder("order-1")).resolves.toEqual(orderFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/orders/order-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getOrder("order-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/orders/order-1", {
      method: "GET",
      tenantScoped: true,
      signal,
    });
  });
});
