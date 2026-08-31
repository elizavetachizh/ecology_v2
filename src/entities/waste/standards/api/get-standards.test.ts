import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getStandards } from "./get-standards";
import { standardFixture } from "../model/standard.fixture";
import type { StandardListResponse } from "../model/standards.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: StandardListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [standardFixture],
};

describe("getStandards", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(getStandards({ limit: 50, offset: 0 })).resolves.toEqual(
      response,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("includes filters, sort and order when provided", async () => {
    await getStandards({
      status: "active",
      unit_id: "unit-1",
      sort: "start_date",
      order: "desc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards?limit=20&offset=10&status=active&unit_id=unit-1&sort=start_date&order=desc",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("omits empty unit_id from query string", async () => {
    await getStandards({
      unit_id: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getStandards({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal },
    );
  });
});
