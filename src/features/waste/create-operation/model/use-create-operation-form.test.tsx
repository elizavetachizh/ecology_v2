import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOperation,
  operationsQueryKeys,
} from "../../../../entities/waste/operations";
import { operationFixture } from "../../../../entities/waste/operations/model/operation.fixture";
import { queryClient } from "../../../../shared/lib/query-client";
import { useCreateOperationForm } from "./use-create-operation-form";
import type { OperationFormValues } from "./operation-form.schema";
import { EMPTY_TYPE_SPECIFIC_VALUES } from "./operation-form.schema";

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    createOperation: vi.fn(),
  };
});

const createOperationMock = vi.mocked(createOperation);

const formedValues: OperationFormValues = {
  date: "2026-03-01",
  operation_type: "formed",
  unit_id: "unit-1",
  instruction_id: "ins-1",
  waste_id: "waste-1",
  amount: "10.000000",
  ...EMPTY_TYPE_SPECIFIC_VALUES,
  waste_source_id: "ws-1",
};

const formedWriteBody = {
  date: "2026-03-01",
  operation_type: "formed" as const,
  unit_id: "unit-1",
  waste_id: "waste-1",
  amount: "10.000000",
  waste_source_id: "ws-1",
  use_purpose: null,
  neutralization_method: null,
  unit_side_id: null,
  transfer_receipt_purpose: null,
  counterparty_id: null,
  passport_id: null,
  ttn_id: null,
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

describe("useCreateOperationForm", () => {
  beforeEach(() => {
    createOperationMock.mockReset();
    createOperationMock.mockResolvedValue(operationFixture);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts create body and invalidates lists and balances", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(() => useCreateOperationForm({ onSaved }), {
      wrapper,
    });

    await act(() => result.current.onSubmit(formedValues));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(operationFixture));
    expect(createOperationMock).toHaveBeenCalledWith(formedWriteBody);
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: operationsQueryKeys.lists(),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: operationsQueryKeys.balances(),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: operationsQueryKeys.current(),
    });
  });

  it("surfaces API error message", async () => {
    createOperationMock.mockRejectedValue(new Error("Недостаточно остатка"));
    const { result } = renderHook(
      () => useCreateOperationForm({ onSaved: vi.fn() }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(formedValues));

    await waitFor(() =>
      expect(result.current.error).toBe("Недостаточно остатка"),
    );

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });
});
