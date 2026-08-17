import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getOperation } from "./get-operation";
import { operationFixture } from "../model/operation.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getOperation", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(operationFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getOperation("op-1")).resolves.toEqual(operationFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/operations/op-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getOperation("op-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/operations/op-1", {
      method: "GET",
      tenantScoped: true,
      signal,
    });
  });
});
