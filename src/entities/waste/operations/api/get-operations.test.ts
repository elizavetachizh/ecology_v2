import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getOperations } from "./get-operations";
import { operationFixture } from "../model/operation.fixture";
import type { OperationListResponse } from "../model/operations.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: OperationListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [operationFixture],
};

describe("getOperations", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(
      getOperations({ limit: 50, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes optional filters when provided", async () => {
    await getOperations({
      unit_id: "unit-1",
      waste_id: "waste-1",
      operation_type: "formed",
      date_from: "2026-01-01",
      date_to: "2026-03-31",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations?limit=20&offset=10&unit_id=unit-1&waste_id=waste-1&operation_type=formed&date_from=2026-01-01&date_to=2026-03-31",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty optional filters from query string", async () => {
    await getOperations({
      unit_id: "",
      waste_id: "",
      date_from: "",
      date_to: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getOperations({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
