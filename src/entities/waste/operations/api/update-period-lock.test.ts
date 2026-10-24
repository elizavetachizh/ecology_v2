import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { userProfileFixture } from "../../persons";
import { updatePeriodLock } from "./update-period-lock";
import type { PeriodLock } from "../model/operations.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

const lockedPeriod: PeriodLock = {
  lock_date: "2026-03-01",
  created_at: "2026-03-02T00:00:00Z",
  updated_at: "2026-03-02T00:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};

const openPeriod: PeriodLock = {
  lock_date: null,
  created_at: "2026-03-02T00:00:00Z",
  updated_at: "2026-03-03T00:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};

describe("updatePeriodLock", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(lockedPeriod);
  });

  it("puts lock_date, tenant-scoped", async () => {
    const body = { lock_date: "2026-03-01" };
    await expect(updatePeriodLock(body)).resolves.toEqual(lockedPeriod);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/period-lock",
      {
        method: "PUT",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("puts lock_date null to open the period", async () => {
    apiSendJsonMock.mockResolvedValue(openPeriod);
    const body = { lock_date: null };
    await expect(updatePeriodLock(body)).resolves.toEqual(openPeriod);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/period-lock",
      {
        method: "PUT",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await updatePeriodLock({ lock_date: "2026-03-01" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/period-lock",
      {
        method: "PUT",
        body: { lock_date: "2026-03-01" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
