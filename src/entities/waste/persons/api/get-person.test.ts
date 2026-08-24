import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPerson } from "./get-person";
import { personFixture } from "../model/person.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getPerson", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(personFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getPerson("person-1")).resolves.toEqual(personFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/persons/person-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPerson("person-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/persons/person-1", {
      method: "GET",
      tenantScoped: true,
      signal,
    });
  });
});
