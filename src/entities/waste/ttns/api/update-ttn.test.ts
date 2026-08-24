import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateTtn } from "./update-ttn";
import { ttnFixture } from "../model/ttn.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateTtn", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(ttnFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { number: "ТТН-002" };
    await expect(updateTtn("t-1", body)).resolves.toEqual(ttnFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/ttns/t-1",
      {
        method: "PATCH",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });
});
