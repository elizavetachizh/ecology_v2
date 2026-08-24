import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPassport } from "./get-passport";
import { passportFixture } from "../model/passport.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getPassport", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(passportFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getPassport("p-1")).resolves.toEqual(passportFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1",
      { method: "GET", tenantScoped: true, signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPassport("p-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1",
      { method: "GET", tenantScoped: true, signal },
    );
  });
});
