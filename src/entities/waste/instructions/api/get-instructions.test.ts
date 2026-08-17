import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getInstructions } from "./get-instructions";
import { instructionFixture } from "../model/instruction.fixture";
import type { InstructionListResponse } from "../model/instructions.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: InstructionListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [instructionFixture],
};

describe("getInstructions", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests list with limit and offset, tenant-scoped", async () => {
    await expect(
      getInstructions({ limit: 50, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/instructions?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes search, status, sort and order when provided", async () => {
    await getInstructions({
      search: "утил",
      status: "active",
      sort: "name",
      order: "asc",
      limit: 20,
      offset: 10,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/instructions?limit=20&offset=10&search=%D1%83%D1%82%D0%B8%D0%BB&status=active&sort=name&order=asc",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("omits empty search from query string", async () => {
    await getInstructions({
      search: "",
      limit: 50,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/instructions?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getInstructions({ limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/instructions?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
