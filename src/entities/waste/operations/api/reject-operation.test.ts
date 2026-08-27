import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { operationFixture } from "../model/operation.fixture";
import { rejectOperation } from "./reject-operation";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("rejectOperation", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(operationFixture);
  });

  it("posts reject by id, tenant-scoped", async () => {
    await expect(rejectOperation("op-1")).resolves.toEqual(operationFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/operations/op-1/reject",
      {
        method: "POST",
        tenantScoped: true,
        signal: undefined,
      },
    );
  });
});
