import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deleteOrder } from "./delete-order";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deleteOrder", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deleteOrder("order-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith("/api/v1/mdm/orders/order-1", {
      tenantScoped: true,
    });
  });
});
