import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPassports } from "./get-passports";
import { passportFixture } from "../model/passport.fixture";
import type { PassportListResponse } from "../model/passports.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: PassportListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [passportFixture],
};

describe("getPassports", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(
      getPassports({ limit: 50, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("includes optional filters when provided", async () => {
    await getPassports({
      search: "СП-",
      status: "active",
      transport_type: "self",
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
      "/api/v1/operations/passports?limit=20&offset=10&search=%D0%A1%D0%9F-&status=active&transport_type=self&unit_id=unit-1&recycling_contract_id=c-1&date_from=2026-01-01&date_to=2026-12-31&sort=date&order=desc",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("omits empty optional filters from query string", async () => {
    await getPassports({
      search: "",
      unit_id: "",
      date_from: "",
      date_to: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPassports({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports?limit=50&offset=0",
      { method: "GET", tenantScoped: true, signal },
    );
  });
});
