import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getWasteSource } from "./get-waste-source";
import { wasteSourceFixture } from "../model/waste-source.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getWasteSource", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(wasteSourceFixture);
  });

  it("requests detail by id, tenant-scoped", async () => {
    await expect(getWasteSource("ws-1")).resolves.toEqual(wasteSourceFixture);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/waste-sources/ws-1", {
      method: "GET",
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getWasteSource("ws-1", signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/mdm/waste-sources/ws-1", {
      method: "GET",
      tenantScoped: true,
      signal,
    });
  });
});
