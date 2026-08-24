import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getTtn } from "./get-ttn";
import { ttnFixture } from "../model/ttn.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getTtn", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(ttnFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getTtn("t-1")).resolves.toEqual(ttnFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/operations/ttns/t-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });
});
