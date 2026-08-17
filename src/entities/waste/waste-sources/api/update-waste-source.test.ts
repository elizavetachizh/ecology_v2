import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateWasteSource } from "./update-waste-source";
import { wasteSourceFixture } from "../model/waste-source.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateWasteSource", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(wasteSourceFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { name: "Цех №4" };
    await expect(updateWasteSource("ws-1", body)).resolves.toEqual(
      wasteSourceFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/waste-sources/ws-1",
      {
        method: "PATCH",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await updateWasteSource("ws-1", { name: "Цех №4" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/waste-sources/ws-1",
      {
        method: "PATCH",
        body: { name: "Цех №4" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
