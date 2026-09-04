import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createUnitInstructionWaste,
  updateUnitInstructionWaste,
  type UnitInstructionWaste,
} from "../../../../entities/waste/unit-instruction-waste";
import { ApiError } from "../../../../shared/api/api-client";
import { invalidateBindingQueries } from "../../../../shared/lib/invalidate-binding-queries";
import { useBindUiwForm } from "./use-bind-uiw-form";

vi.mock("../../../../entities/waste/unit-instruction-waste", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/unit-instruction-waste")
    >();
  return {
    ...actual,
    createUnitInstructionWaste: vi.fn(),
    updateUnitInstructionWaste: vi.fn(),
  };
});

vi.mock("../../../../shared/lib/invalidate-binding-queries", () => ({
  invalidateBindingQueries: vi.fn(),
}));

const createMock = vi.mocked(createUnitInstructionWaste);
const updateMock = vi.mocked(updateUnitInstructionWaste);
const invalidateMock = vi.mocked(invalidateBindingQueries);

const wasteId = "550e8400-e29b-41d4-a716-446655440000";
const sourceId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";
const scope = { unitId: "unit-1", instructionId: "instruction-1" };

const binding: UnitInstructionWaste = {
  id: "uiw-1",
  tenant_id: "tenant-1",
  unit_id: "unit-1",
  unit: { id: "unit-1", name: "Цех", short_name: "Ц1" },
  instruction_id: "instruction-1",
  instruction: {
    id: "instruction-1",
    name: "Инструкция",
    short_name: "И-1",
    start_date: null,
    end_date: null,
    status: "active",
  },
  waste_id: wasteId,
  waste: {
    id: wasteId,
    waste_classifier_id: 1,
    waste_classifier: { id: 1, code: 111000000000, name: "Отход" },
    hazard_class: "class_4",
    uom: "ton",
  },
  waste_source_ids: [sourceId],
  waste_sources: [{ id: sourceId, name: "Цех №3" }],
  transport_unit: "1.5",
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

const values = {
  waste_id: wasteId,
  waste_source_ids: [sourceId],
  transport_unit: "2",
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

describe("useBindUiwForm", () => {
  beforeEach(() => {
    createMock.mockReset();
    updateMock.mockReset();
    invalidateMock.mockReset();
    createMock.mockResolvedValue(binding);
    updateMock.mockResolvedValue({ ...binding, transport_unit: "2" });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a binding and notifies onSaved", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () => useBindUiwForm({ mode: "create", scope, onSaved }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(values));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(binding));
    expect(createMock).toHaveBeenCalledWith(scope, values);
    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateMock).toHaveBeenCalled();
  });

  it("hydrates edit values and patches the existing binding", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () =>
        useBindUiwForm({
          mode: "edit",
          scope,
          initial: binding,
          onSaved,
        }),
      { wrapper },
    );

    expect(result.current.form.getValues()).toEqual({
      waste_id: wasteId,
      waste_source_ids: [sourceId],
      transport_unit: "1.5",
    });

    await act(() => result.current.onSubmit(values));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(updateMock).toHaveBeenCalledWith(scope, "uiw-1", values);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("maps a 409 create error for the form", async () => {
    createMock.mockRejectedValue(
      new ApiError("Сервер вернул ошибку 409", 409, "http_error"),
    );
    const { result } = renderHook(
      () => useBindUiwForm({ mode: "create", scope, onSaved: vi.fn() }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(values));

    await waitFor(() =>
      expect(result.current.error).toBe(
        "Такая привязка отхода уже существует.",
      ),
    );
  });
});
