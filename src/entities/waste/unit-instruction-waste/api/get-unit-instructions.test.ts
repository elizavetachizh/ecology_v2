import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { instructionFixture } from "../../instructions/model/instruction.fixture";
import type { UnitInstructionListResponse } from "../model/uiw.types";
import { getUnitInstructions } from "./get-unit-instructions";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: UnitInstructionListResponse = {
  total: 1,
  limit: 50,
  offset: 0,
  items: [
    {
      id: instructionFixture.id,
      name: instructionFixture.name,
      short_name: instructionFixture.short_name,
      start_date: instructionFixture.start_date,
      end_date: instructionFixture.end_date,
      status: instructionFixture.status,
    },
  ],
};

describe("getUnitInstructions", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests unit instructions with limit and offset, tenant-scoped", async () => {
    await expect(
      getUnitInstructions("unit-1", { limit: 50, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/units/unit-1/instructions?limit=50&offset=0",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes sort and order when provided", async () => {
    await getUnitInstructions("unit-1", {
      limit: 50,
      offset: 0,
      sort: "name",
      order: "asc",
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/units/unit-1/instructions?limit=50&offset=0&sort=name&order=asc",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getUnitInstructions("unit-1", { limit: 50, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/units/unit-1/instructions?limit=50&offset=0",
      { signal, tenantScoped: true },
    );
  });
});
