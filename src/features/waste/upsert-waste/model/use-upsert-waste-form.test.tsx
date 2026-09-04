import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createWaste,
  updateWaste,
  wastesQueryKeys,
  type Waste,
} from "../../../../entities/waste/wastes";
import { queryClient } from "../../../../shared/lib/query-client";
import { useUpsertWasteForm } from "./use-upsert-waste-form";
import type { WasteFormValues } from "./waste-form.schema";

vi.mock("../../../../entities/waste/wastes", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/wastes")>();
  return {
    ...actual,
    createWaste: vi.fn(),
    updateWaste: vi.fn(),
  };
});

const createMock = vi.mocked(createWaste);
const updateMock = vi.mocked(updateWaste);

const waste: Waste = {
  id: "waste-1",
  tenant_id: "tenant-1",
  waste_classifier_id: 1,
  waste_classifier: { id: 1, code: 111000000000, name: "Опилки" },
  hazard_class: "class_4",
  uom: "ton",
  physical_state: "solid",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  created_by: {
    id: "user-1",
    username: "test",
    email: null,
    first_name: null,
    last_name: null,
  },
  updated_by: {
    id: "user-1",
    username: "test",
    email: null,
    first_name: null,
    last_name: null,
  },
};

const values: WasteFormValues = {
  waste_classifier_id: 1,
  hazard_class: "class_4",
  uom: "ton",
  physical_state: "solid",
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useUpsertWasteForm", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateMock.mockReset();
    createMock.mockResolvedValue(waste);
    updateMock.mockResolvedValue(waste);
    queryClient.clear();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it("creates a waste and notifies onSaved", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () => useUpsertWasteForm({ mode: "create", onSaved }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(false, values));

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(waste, { close: false }),
    );
    expect(createMock).toHaveBeenCalledWith(values);
    expect(updateMock).not.toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: wastesQueryKeys.lists(),
    });
  });

  it("hydrates edit values and patches the waste", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () =>
        useUpsertWasteForm({
          mode: "edit",
          wasteId: "waste-1",
          initial: waste,
          onSaved,
        }),
      { wrapper },
    );

    expect(result.current.form.getValues()).toEqual({
      waste_classifier_id: 1,
      hazard_class: "class_4",
      uom: "ton",
      physical_state: "solid",
    });

    await act(() => result.current.onSubmit(true, { ...values, uom: "kg" }));

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(waste, { close: true }),
    );
    expect(updateMock).toHaveBeenCalledWith("waste-1", {
      ...values,
      uom: "kg",
    });
    expect(createMock).not.toHaveBeenCalled();
    expect(
      queryClient.getQueryData(
        wastesQueryKeys.detail(waste.tenant_id, waste.id),
      ),
    ).toEqual(waste);
  });

  it("surfaces an API error on create", async () => {
    createMock.mockRejectedValue(new Error("Отход уже есть в справочнике"));
    const { result } = renderHook(
      () => useUpsertWasteForm({ mode: "create", onSaved: vi.fn() }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(false, values));

    await waitFor(() =>
      expect(result.current.error).toBe("Отход уже есть в справочнике"),
    );
  });
});
