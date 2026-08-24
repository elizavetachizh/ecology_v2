import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updateCounterparty } from "./update-counterparty";
import { counterpartyFixture } from "../model/counterparty.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updateCounterparty", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(counterpartyFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { name: "Ромашка+", is_active: false };
    await expect(updateCounterparty("cp-1", body)).resolves.toEqual(
      counterpartyFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties/cp-1",
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
    await updateCounterparty("cp-1", { name: "Ромашка+" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties/cp-1",
      {
        method: "PATCH",
        body: { name: "Ромашка+" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
