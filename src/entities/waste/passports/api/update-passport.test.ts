import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updatePassport } from "./update-passport";
import { passportFixture } from "../model/passport.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updatePassport", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(passportFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { number: "СП-002" };
    await expect(updatePassport("p-1", body)).resolves.toEqual(passportFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1",
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
    await updatePassport("p-1", { date: "2026-03-16" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports/p-1",
      {
        method: "PATCH",
        body: { date: "2026-03-16" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
