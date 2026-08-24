import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { updatePerson } from "./update-person";
import { personFixture } from "../model/person.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("updatePerson", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(personFixture);
  });

  it("patches by id, tenant-scoped", async () => {
    const body = { name: "Петров Пётр" };
    await expect(updatePerson("person-1", body)).resolves.toEqual(
      personFixture,
    );

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons/person-1",
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
    await updatePerson("person-1", { name: "Петров Пётр" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons/person-1",
      {
        method: "PATCH",
        body: { name: "Петров Пётр" },
        tenantScoped: true,
        signal,
      },
    );
  });
});
