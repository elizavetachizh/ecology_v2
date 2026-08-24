import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiSendJson } from "../../../../shared/api/api-client";
import { createPerson } from "./create-person";
import { personFixture } from "../model/person.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiSendJson: vi.fn(),
}));

const apiSendJsonMock = vi.mocked(apiSendJson);

describe("createPerson", () => {
  beforeEach(() => {
    apiSendJsonMock.mockResolvedValue(personFixture);
  });

  it("posts create body, tenant-scoped", async () => {
    const body = {
      name: "Иванов Иван Иванович",
      first_name: "Иван",
      last_name: "Иванов",
      middle_name: "Иванович",
    };
    await expect(createPerson(body)).resolves.toEqual(personFixture);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/persons", {
      method: "POST",
      body,
      tenantScoped: true,
      signal: undefined,
    });
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await createPerson({ name: "Иванов Иван Иванович" }, signal);

    expect(apiSendJsonMock).toHaveBeenCalledWith("/api/v1/mdm/persons", {
      method: "POST",
      body: { name: "Иванов Иван Иванович" },
      tenantScoped: true,
      signal,
    });
  });
});
