import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createPassport } from "./create-passport";
import { passportFixture } from "../model/passport.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

const body = {
  number: "СП-001",
  date: "2026-03-15",
  unit_id: "33333333-3333-4333-8333-333333333333",
  recycling_contract_id: "44444444-4444-4444-8444-444444444444",
  transport_type: "self" as const,
  transport_contract_id: null,
  status: "active" as const,
  waste_producer_id: null,
  wastes: [{ waste_id: "77777777-7777-4777-8777-777777777777" }],
};

describe("createPassport", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(passportFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    await expect(createPassport(body)).resolves.toEqual(passportFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports",
      {
        method: "POST",
        body,
        tenantScoped: true,
        signal: undefined,
      },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await createPassport(body, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/operations/passports",
      {
        method: "POST",
        body,
        tenantScoped: true,
        signal,
      },
    );
  });
});
