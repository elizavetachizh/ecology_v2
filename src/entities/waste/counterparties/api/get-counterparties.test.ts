import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getCounterparties } from "./get-counterparties";
import { counterpartyFixture } from "../model/counterparty.fixture";
import type { CounterpartyListResponse } from "../model/counterparties.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: CounterpartyListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [counterpartyFixture],
};

describe("getCounterparties", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(
      getCounterparties({ limit: 50, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes search, filters, sort and order when provided", async () => {
    await getCounterparties({
      search: "ромашка",
      is_active: true,
      is_individual: false,
      sort: "unp",
      order: "desc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties?limit=20&offset=10&search=%D1%80%D0%BE%D0%BC%D0%B0%D1%88%D0%BA%D0%B0&is_individual=false&is_active=true&sort=unp&order=desc",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty search from query string", async () => {
    await getCounterparties({
      search: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getCounterparties({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
