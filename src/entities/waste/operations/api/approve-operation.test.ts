import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { operationFixture } from "../model/operation.fixture";
import { approveOperation } from "./approve-operation";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("approveOperation", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(operationFixture);
  });

  it("posts approve by id, tenant-scoped", async () => {
    await expect(approveOperation("op-1")).resolves.toEqual(operationFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/operations/op-1/approve",
      {
        method: "POST",
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await approveOperation("op-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/operations/op-1/approve",
      {
        method: "POST",
        tenantScoped: true,
        signal,
      },
    );
  });
});
