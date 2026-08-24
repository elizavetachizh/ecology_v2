import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getPersonAssignments } from "./get-person-assignments";
import { personAssignmentsFixture } from "../../orders/model/order.fixture";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

describe("getPersonAssignments", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(personAssignmentsFixture);
  });

  it("requests assignments without on (backend default today UTC)", async () => {
    await expect(
      getPersonAssignments({ personId: "person-1" }),
    ).resolves.toEqual(personAssignmentsFixture);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons/person-1/assignments",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("includes on date when provided", async () => {
    await getPersonAssignments({ personId: "person-1", on: "2024-06-01" });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons/person-1/assignments?on=2024-06-01",
      { signal: undefined, tenantScoped: true },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getPersonAssignments({ personId: "person-1" }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons/person-1/assignments",
      { signal, tenantScoped: true },
    );
  });
});
