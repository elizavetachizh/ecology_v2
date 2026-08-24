import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deleteCounterparty } from "./delete-counterparty";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deleteCounterparty", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deleteCounterparty("cp-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties/cp-1",
      { tenantScoped: true },
    );
  });
});
