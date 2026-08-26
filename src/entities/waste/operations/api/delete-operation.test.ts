import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deleteOperation } from "./delete-operation";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deleteOperation", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deleteOperation("op-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith("/api/v1/operations/operations/op-1", {
      tenantScoped: true,
    });
  });
});
