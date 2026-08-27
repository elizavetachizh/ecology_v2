import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPermit } from "./get-permit";
import { permitFixture } from "../model/permit.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getPermit", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(permitFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getPermit("permit-1")).resolves.toEqual(permitFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/permits/permit-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPermit("permit-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/permits/permit-1", {
      method: "GET",
      tenantScoped: true,
      signal,
    });
  });
});
