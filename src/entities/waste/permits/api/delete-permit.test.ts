import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deletePermit } from "./delete-permit";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deletePermit", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deletePermit("permit-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith("/api/v1/mdm/permits/permit-1", {
      tenantScoped: true,
    });
  });
});
