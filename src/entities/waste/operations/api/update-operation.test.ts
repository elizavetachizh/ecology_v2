import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateOperation } from "./update-operation";
import { operationFixture } from "../model/operation.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateOperation", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(operationFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { amount: "12.500000" };
    await expect(updateOperation("op-1", body)).resolves.toEqual(
      operationFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/operations/op-1", {
      method: "PATCH",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await updateOperation("op-1", { date: "2026-03-02" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/operations/op-1", {
      method: "PATCH",
      body: { date: "2026-03-02" },
      tenantScoped: true,
      signal,
    });
  });
});
