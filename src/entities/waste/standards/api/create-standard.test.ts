import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createStandard } from "./create-standard";
import { standardFixture } from "../model/standard.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createStandard", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(standardFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = {
      start_date: "2026-01-15",
      unit_id: "unit-1",
      wastes: [{ waste_id: "waste-1", amount: "12.5" }],
    };
    await expect(createStandard(body)).resolves.toEqual(standardFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/standards", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await createStandard(
      { start_date: "2026-01-15", unit_id: "unit-1" },
      signal,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/standards", {
      method: "POST",
      body: {
        start_date: "2026-01-15",
        unit_id: "unit-1",
      },
      tenantScoped: true,
      signal,
    });
  });
});
