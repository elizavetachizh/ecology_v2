import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deleteInstruction } from "./delete-instruction";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deleteInstruction", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deleteInstruction("ins-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith(
      "/api/v1/mdm/instructions/ins-1",
      { tenantScoped: true },
    );
  });
});
