import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getOrders } from "./get-orders";
import { orderListItemFixture } from "../model/order.fixture";
import type { OrderListResponse } from "../model/orders.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: OrderListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [orderListItemFixture],
};

describe("getOrders", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(getOrders({ limit: 50, offset: 0 })).resolves.toEqual(
      response,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes search, sort and order when provided", async () => {
    await getOrders({
      search: "12",
      sort: "date",
      order: "desc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders?limit=20&offset=10&search=12&sort=date&order=desc",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty search from query string", async () => {
    await getOrders({
      search: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getOrders({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
