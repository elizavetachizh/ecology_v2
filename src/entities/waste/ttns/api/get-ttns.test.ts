import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getTtns } from "./get-ttns";
import { ttnFixture } from "../model/ttn.fixture";
import type { TtnListResponse } from "../model/ttns.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: TtnListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [ttnFixture],
};

describe("getTtns", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(getTtns({ limit: 50, offset: 0 })).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/ttns?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("includes optional filters when provided", async () => {
    await getTtns({
      search: "TTN-",
      status: "active",
      unit_id: "unit-1",
      recycling_contract_id: "c-1",
      date_from: "2026-01-01",
      date_to: "2026-12-31",
      sort: "date",
      order: "desc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/ttns?limit=20&offset=10&search=TTN-&status=active&unit_id=unit-1&recycling_contract_id=c-1&date_from=2026-01-01&date_to=2026-12-31&sort=date&order=desc",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("omits empty optional filters from query string", async () => {
    await getTtns({
      search: "",
      unit_id: "",
      date_from: "",
      date_to: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/ttns?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getTtns({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/ttns?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal },
    );
  });
});
