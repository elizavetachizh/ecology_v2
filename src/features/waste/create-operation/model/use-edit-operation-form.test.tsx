import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  operationsQueryKeys,
  updateOperation,
} from "../../../../entities/waste/operations";
import {
  makeOperation,
  operationFixture,
} from "../../../../entities/waste/operations/model/operation.fixture";
import { queryClient } from "../../../../shared/lib/query-client";
import { useEditOperationForm } from "./use-edit-operation-form";

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    updateOperation: vi.fn(),
  };
});

const updateOperationMock = vi.mocked(updateOperation);

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useEditOperationForm", () => {
  beforeEach(() => {
    updateOperationMock.mockReset();
    updateOperationMock.mockResolvedValue(operationFixture);
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("patches date, amount and waste source for formed", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () => useEditOperationForm({ operation: operationFixture, onSaved }),
      { wrapper },
    );

    await act(() =>
      result.current.onSubmit(true, {
        date: "2026-04-02",
        amount: "3.5",
        waste_source_id: "ws-2",
      }),
    );

    await waitFor(() =>
      expect(onSaved).toHaveBeenCalledWith(operationFixture, { close: true }),
    );
    expect(updateOperationMock).toHaveBeenCalledWith("op-1", {
      date: "2026-04-02",
      amount: "3.5",
      waste_source_id: "ws-2",
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: operationsQueryKeys.details(),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: operationsQueryKeys.balances(),
    });
  });

  it("omits waste_source_id for used operations", async () => {
    const onSaved = vi.fn();
    const used = makeOperation({
      operation_type: "used",
      waste_source_id: null,
      waste_source: null,
      use_purpose: "energy",
    });
    const { result } = renderHook(
      () => useEditOperationForm({ operation: used, onSaved }),
      { wrapper },
    );

    await act(() =>
      result.current.onSubmit(false, {
        date: used.date,
        amount: "1",
        waste_source_id: "",
      }),
    );

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(updateOperationMock).toHaveBeenCalledWith("op-1", {
      date: used.date,
      amount: "1",
    });
  });
});
