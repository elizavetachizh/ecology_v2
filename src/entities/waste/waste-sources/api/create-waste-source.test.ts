import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createWasteSource } from "./create-waste-source";
import { wasteSourceFixture } from "../model/waste-source.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createWasteSource", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(wasteSourceFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = { name: "Цех №3" };
    await expect(createWasteSource(body)).resolves.toEqual(wasteSourceFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/waste-sources", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await createWasteSource({ name: "Цех №3" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/waste-sources", {
      method: "POST",
      body: { name: "Цех №3" },
      tenantScoped: true,
      signal,
    });
  });
});
