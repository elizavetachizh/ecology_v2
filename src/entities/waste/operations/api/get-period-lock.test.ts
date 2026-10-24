import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPeriodLock } from "./get-period-lock";
import type { PeriodLock } from "../model/operations.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const openPeriodLock: PeriodLock = {
  lock_date: null,
  created_at: null,
  updated_at: null,
  created_by: null,
  updated_by: null,
};

describe("getPeriodLock", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(openPeriodLock);
  });

  it("requests the tenant period lock", async () => {
    await expect(getPeriodLock()).resolves.toEqual(openPeriodLock);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/operations/period-lock", {
      signal: undefined,
      tenantScoped: true,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPeriodLock(signal);

    expect(apiJsonMock).toHaveBeenCalledWith("/api/v1/operations/period-lock", {
      signal,
      tenantScoped: true,
    });
  });
});
