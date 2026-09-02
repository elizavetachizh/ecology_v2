import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateOrder } from "./update-order";
import { orderFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateOrder", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(orderFixture);
  });

  it("patches number, start_date and unit_id, tenant-scoped", async () => {
    const body = {
      number: "13-ОД",
      start_date: "2024-02-01",
      unit_id: "unit-2",
    };
    await expect(updateOrder("order-1", body)).resolves.toEqual(orderFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/orders/order-1", {
      method: "PATCH",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await updateOrder("order-1", { number: "13-ОД" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/orders/order-1", {
      method: "PATCH",
      body: { number: "13-ОД" },
      tenantScoped: true,
      signal,
    });
  });
});
