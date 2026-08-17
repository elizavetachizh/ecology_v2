import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiJson } from "../../../../shared/api/api-client";
import { getWasteClassifiers } from "./get-waste-classifier";
import type { WasteClassifierListResponse } from "../model/waste-classifier.types";

vi.mock("../../../../shared/api/api-client", () => ({
  apiJson: vi.fn(),
}));

const apiJsonMock = vi.mocked(apiJson);

const response: WasteClassifierListResponse = {
  total: 1,
  limit: 20,
  offset: 0,
  items: [{ id: 1, code: 12345678901, name: "Отход тестовый" }],
};

describe("getWasteClassifiers", () => {
  beforeEach(() => {
    apiJsonMock.mockResolvedValue(response);
  });

  it("requests classifiers with limit and offset", async () => {
    await expect(
      getWasteClassifiers({ limit: 20, offset: 0 }),
    ).resolves.toEqual(response);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/classifiers/wastes?limit=20&offset=0",
      { signal: undefined },
    );
  });

  it("includes search when provided", async () => {
    await getWasteClassifiers({
      search: "пластик",
      limit: 10,
      offset: 5,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/classifiers/wastes?limit=10&offset=5&search=%D0%BF%D0%BB%D0%B0%D1%81%D1%82%D0%B8%D0%BA",
      { signal: undefined },
    );
  });

  it("omits empty search from query string", async () => {
    await getWasteClassifiers({
      search: "",
      limit: 20,
      offset: 0,
    });

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/classifiers/wastes?limit=20&offset=0",
      { signal: undefined },
    );
  });

  it("forwards abort signal", async () => {
    const signal = new AbortController().signal;
    await getWasteClassifiers({ limit: 20, offset: 0 }, signal);

    expect(apiJsonMock).toHaveBeenCalledWith(
      "/api/v1/classifiers/wastes?limit=20&offset=0",
      { signal },
    );
  });
});
