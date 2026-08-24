import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createOrderState } from "./create-order-state";
import { orderStateFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createOrderState", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(orderStateFixture);
  });

  it("posts state body, tenant-scoped", async () => {
    const body = {
      start_date: "2024-06-01",
      items: [{ unit_id: "unit-1", person_id: "person-1" }],
    };
    await expect(createOrderState("order-1", body)).resolves.toEqual(
      orderStateFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states",
      {
        method: "POST",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    const body = { start_date: "2024-06-01", items: [] };
    await createOrderState("order-1", body, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states",
      {
        method: "POST",
        body,
        tenantScoped: true,
        signal,
      },
    );
  });
});
