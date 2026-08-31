import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getStandard } from "./get-standard";
import { standardFixture } from "../model/standard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getStandard", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(standardFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getStandard("standard-1")).resolves.toEqual(standardFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards/standard-1",
      {
        method: "GET",
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getStandard("standard-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards/standard-1",
      {
        method: "GET",
        tenantScoped: true,
        signal,
      },
    );
  });
});
