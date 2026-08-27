import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createPermit } from "./create-permit";
import { permitFixture } from "../model/permit.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createPermit", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(permitFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = {
      number: "Р-001",
      start_date: "2026-01-15",
      unit_id: "unit-1",
      burial_wastes: [{ waste_id: "waste-1", amount: "12.5" }],
    };
    await expect(createPermit(body)).resolves.toEqual(permitFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/permits", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await createPermit({ number: "Р-001", start_date: "2026-01-15", unit_id: "unit-1" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/permits", {
      method: "POST",
      body: {
        number: "Р-001",
        start_date: "2026-01-15",
        unit_id: "unit-1",
      },
      tenantScoped: true,
      signal,
    });
  });
});
