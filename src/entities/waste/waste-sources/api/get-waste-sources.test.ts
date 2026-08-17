import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getWasteSources } from "./get-waste-sources";
import { wasteSourceFixture } from "../model/waste-source.fixture";
import type { WasteSourceListResponse } from "../model/waste-sources.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: WasteSourceListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [wasteSourceFixture],
};

describe("getWasteSources", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(
      getWasteSources({ limit: 50, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/waste-sources?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes search, sort and order when provided", async () => {
    await getWasteSources({
      search: "цех",
      sort: "name",
      order: "asc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/waste-sources?limit=20&offset=10&search=%D1%86%D0%B5%D1%85&sort=name&order=asc",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty search from query string", async () => {
    await getWasteSources({
      search: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/waste-sources?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getWasteSources({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/waste-sources?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
