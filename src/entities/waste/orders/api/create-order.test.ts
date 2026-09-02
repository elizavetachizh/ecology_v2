import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createOrder } from "./create-order";
import { orderFixture } from "../model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createOrder", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(orderFixture);
  });

  it("posts number, start_date and unit_id, tenant-scoped", async () => {
    const body = {
      number: "12-ОД",
      start_date: "2024-01-15",
      unit_id: "unit-1",
    };
    await expect(createOrder(body)).resolves.toEqual(orderFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/orders", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    const body = {
      number: "12-ОД",
      start_date: "2024-01-15",
      unit_id: "unit-1",
    };
    await createOrder(body, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/orders", {
      method: "POST",
      body,
      tenantScoped: true,
      signal,
    });
  });
});
