import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updatePermit } from "./update-permit";
import { permitFixture } from "../model/permit.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updatePermit", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(permitFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { status: "inactive" as const, burial_wastes: [] };
    await expect(updatePermit("permit-1", body)).resolves.toEqual(
      permitFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/permits/permit-1",
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
    await updatePermit("permit-1", { number: "Р-002" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/permits/permit-1",
      {
        method: "PATCH",
        body: { number: "Р-002" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
