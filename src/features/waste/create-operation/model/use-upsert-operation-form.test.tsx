import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createOperation,
  operationsQueryKeys,
  updateOperation,
} from "../../../../entities/waste/operations";
import { operationFixture } from "../../../../entities/waste/operations/model/operation.fixture";
import { queryClient } from "../../../../shared/lib/query-client";
import { useUpsertOperationForm } from "./use-upsert-operation-form";
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
    updateOperation: vi.fn(),
  };
});

const createOperationMock = vi.mocked(createOperation);
const updateOperationMock = vi.mocked(updateOperation);

const formedValues: OperationFormValues = {
  date: "2026-03-01",
  operation_type: "formed",
  unit_id: "unit-1",
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

describe("useUpsertOperationForm", () => {
  beforeEach(() => {
    createOperationMock.mockReset();
    updateOperationMock.mockReset();
    createOperationMock.mockResolvedValue(operationFixture);
    updateOperationMock.mockResolvedValue(operationFixture);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("posts create body and invalidates lists and balances", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () => useUpsertOperationForm({ mode: "create", onSaved }),
      { wrapper },
    );

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

  it("patches on edit and sends null waste_source_id for used", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () =>
        useUpsertOperationForm({
          mode: "edit",
          initial: operationFixture,
          onSaved,
        }),
      { wrapper },
    );

    await act(() =>
      result.current.onSubmit({
        ...formedValues,
        operation_type: "used",
        waste_source_id: "",
        use_purpose: "energy",
      }),
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(operationFixture));
    expect(updateOperationMock).toHaveBeenCalledWith("op-1", {
      ...formedWriteBody,
      operation_type: "used",
      waste_source_id: null,
      use_purpose: "energy",
    });
  });

  it("surfaces API error message", async () => {
    createOperationMock.mockRejectedValue(new Error("Недостаточно остатка"));
    const { result } = renderHook(
      () => useUpsertOperationForm({ mode: "create", onSaved: vi.fn() }),
      { wrapper },
    );

    await act(() => result.current.onSubmit(formedValues));

    await waitFor(() =>
      expect(result.current.error).toBe("Недостаточно остатка"),
    );
  });
});
