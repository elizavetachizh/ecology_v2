import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deletePassport } from "./delete-passport";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deletePassport", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deletePassport("p-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1",
      { tenantScoped: true },
    );
  });
});
