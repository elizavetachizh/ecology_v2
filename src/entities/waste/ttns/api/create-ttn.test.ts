import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createTtn } from "./create-ttn";
import { ttnFixture } from "../model/ttn.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

const body = {
  number: "ТТН-001",
  date: "2026-03-15",
  unit_id: "33333333-3333-4333-8333-333333333333",
  recycling_contract_id: "44444444-4444-4444-8444-444444444444",
  status: "active" as const,
};

describe("createTtn", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(ttnFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    await expect(createTtn(body)).resolves.toEqual(ttnFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/operations/ttns", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });
});
