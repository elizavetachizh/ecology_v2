import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPermits } from "./get-permits";
import { permitFixture } from "../model/permit.fixture";
import type { PermitListResponse } from "../model/permits.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: PermitListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [permitFixture],
};

describe("getPermits", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(getPermits({ limit: 50, offset: 0 })).resolves.toEqual(
      response,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/permits?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("includes search, filters, sort and order when provided", async () => {
    await getPermits({
      search: "Р-00",
      status: "active",
      unit_id: "unit-1",
      sort: "start_date",
      order: "desc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/permits?limit=20&offset=10&search=%D0%A0-00&status=active&unit_id=unit-1&sort=start_date&order=desc",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("omits empty search from query string", async () => {
    await getPermits({
      search: "",
      unit_id: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/permits?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPermits({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/permits?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal },
    );
  });
});
