import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateOrderState } from "./update-order-state";
import { orderStateFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateOrderState", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(orderStateFixture);
  });

  it("patches state items as full replace, tenant-scoped", async () => {
    const body = {
      start_date: "2024-06-01",
      items: [{ unit_id: "unit-2", person_id: "person-2" }],
    };
    await expect(updateOrderState("order-1", "state-1", body)).resolves.toEqual(
      orderStateFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states/state-1",
      {
        method: "PATCH",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await updateOrderState(
      "order-1",
      "state-1",
      { start_date: "2024-06-01" },
      signal,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states/state-1",
      {
        method: "PATCH",
        body: { start_date: "2024-06-01" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
