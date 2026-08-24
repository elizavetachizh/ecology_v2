import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createCounterparty } from "./create-counterparty";
import { counterpartyFixture } from "../model/counterparty.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createCounterparty", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(counterpartyFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = {
      name: "Ромашка",
      full_name: "ООО «Ромашка»",
      unp: "091234567",
    };
    await expect(createCounterparty(body)).resolves.toEqual(
      counterpartyFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties",
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
    await createCounterparty({ name: "Ромашка" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/counterparties",
      {
        method: "POST",
        body: { name: "Ромашка" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
