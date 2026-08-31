import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateStandard } from "./update-standard";
import { standardFixture } from "../model/standard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateStandard", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(standardFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { start_date: "2026-02-01", wastes: [] };
    await expect(updateStandard("standard-1", body)).resolves.toEqual(
      standardFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards/standard-1",
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
    await updateStandard("standard-1", { unit_id: "unit-2" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/standards/standard-1",
      {
        method: "PATCH",
        body: { unit_id: "unit-2" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
