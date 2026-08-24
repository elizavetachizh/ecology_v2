import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deleteOrderState } from "./delete-order-state";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deleteOrderState", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes state by id, tenant-scoped", async () => {
    await expect(
      deleteOrderState("order-1", "state-1"),
    ).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith(
      "/api/v1/mdm/orders/order-1/states/state-1",
      { tenantScoped: true },
    );
  });
});
