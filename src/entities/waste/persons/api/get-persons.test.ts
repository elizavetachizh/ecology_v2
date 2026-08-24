import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPersons } from "./get-persons";
import { personFixture } from "../model/person.fixture";
import type { PersonListResponse } from "../model/persons.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: PersonListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [personFixture],
};

describe("getPersons", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(getPersons({ limit: 50, offset: 0 })).resolves.toEqual(
      response,
    );

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes search, sort and order when provided", async () => {
    await getPersons({
      search: "иван",
      sort: "last_name",
      order: "asc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons?limit=20&offset=10&search=%D0%B8%D0%B2%D0%B0%D0%BD&sort=last_name&order=asc",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty search from query string", async () => {
    await getPersons({
      search: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPersons({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
