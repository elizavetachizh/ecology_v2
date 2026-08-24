import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiDelete } from "../../../../shared/api/api-client";
import { deletePerson } from "./delete-person";

vi.mock("../../../../shared/api/api-client", () => ({
  apiDelete: vi.fn(),
}));

const apiDeleteMock = vi.mocked(apiDelete);

describe("deletePerson", () => {
  beforeEach(() => {
    apiDeleteMock.mockResolvedValue(undefined);
  });

  it("deletes by id, tenant-scoped", async () => {
    await expect(deletePerson("person-1")).resolves.toBeUndefined();

    expect(apiDeleteMock).toHaveBeenCalledWith(
      "/api/v1/mdm/persons/person-1",
      { tenantScoped: true },
    );
  });
});
