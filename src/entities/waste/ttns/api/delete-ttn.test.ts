import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deleteTtn } from "./delete-ttn";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deleteTtn", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deleteTtn("t-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith("/api/v1/operations/ttns/t-1", {
      tenantScoped: true,
    });
  });
});
