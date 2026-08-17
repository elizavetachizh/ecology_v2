import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createOperation } from "./create-operation";
import { operationFixture } from "../model/operation.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createOperation", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(operationFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = {
      date: "2026-03-01",
      operation_type: "formed" as const,
      unit_id: "unit-1",
      waste_id: "waste-1",
      waste_source_id: "ws-1",
      amount: "10.000000",
    };
    await expect(createOperation(body)).resolves.toEqual(operationFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/operations", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    const body = {
      date: "2026-03-01",
      operation_type: "used" as const,
      unit_id: "unit-1",
      waste_id: "waste-1",
      waste_source_id: null,
      amount: "1.5",
    };
    await createOperation(body, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/operations", {
      method: "POST",
      body,
      tenantScoped: true,
      signal,
    });
  });
});
