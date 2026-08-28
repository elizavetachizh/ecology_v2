import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TenantContext,
  type Tenant,
  type TenantContextValue,
} from "../../../../entities/tenant";
import type { CurrentUser } from "../../../../entities/user";
import { makeInstruction } from "../../../../entities/waste/instructions/model/instruction.fixture";
import {
  makeOperation,
  operationFixture,
} from "../../../../entities/waste/operations/model/operation.fixture";
import { OperationCard } from "./OperationCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...rest }: { children: ReactNode }) => (
    <a {...rest}>{children}</a>
  ),
}));

vi.mock("../../../../entities/waste/units", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../entities/waste/units")>();
  return {
    ...actual,
    useUnitsTreeQuery: () => ({
      tree: [],
      loading: false,
      error: null,
    }),
  };
});

vi.mock("../../../../entities/waste/unit-instruction-waste", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/unit-instruction-waste")
    >();
  return {
    ...actual,
    useUnitInstructionsListQuery: () => ({
      items: [makeInstruction()],
      loading: false,
      error: null,
    }),
    useUnitInstructionWastesListQuery: () => ({
      items: [
        {
          waste_id: operationFixture.waste_id,
          waste: operationFixture.waste,
          waste_sources: operationFixture.waste_source
            ? [operationFixture.waste_source]
            : [],
        },
      ],
      total: 1,
      loading: false,
      error: null,
    }),
  };
});

vi.mock("../model/use-instruction-id-for-waste", () => ({
  useInstructionIdForWaste: () => ({
    instructionId: "ins-1",
    loading: false,
  }),
}));

vi.mock("../../../../entities/waste/operations", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../../entities/waste/operations")
    >();
  return {
    ...actual,
    useCurrentBalanceQuery: () => ({
      balance: null,
      loading: false,
      error: null,
    }),
  };
});

const user: CurrentUser = {
  id: 1,
  realm: "mingas",
  uuid: "user-id",
  username: "testuser",
  email: null,
  roles: ["operator"],
  issuer: "https://auth.example.com/realms/mingas",
};

const tenant: Tenant = {
  id: "tenant-1",
  realm: "mingas",
  name: "Головная",
  short: "Головная",
  parent_id: null,
  children: [],
};

const tenantValue: TenantContextValue = {
  user,
  tenants: [tenant],
  flatTenants: [tenant],
  activeTenantId: "tenant-1",
  activeTenant: tenant,
  selectTenant: vi.fn(),
};

function renderCard(operation = operationFixture) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <TenantContext.Provider value={tenantValue}>
        <OperationCard
          operation={operation}
          onSaved={vi.fn()}
          onCancel={vi.fn()}
          onDeleted={vi.fn()}
        />
      </TenantContext.Provider>
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe("OperationCard", () => {
  it("shows the operation card without wizard steps", async () => {
    renderCard();

    expect(
      screen.getByRole("heading", { name: "Образовано · 01.03.2026" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Подтверждено")).toBeInTheDocument();
    expect(screen.getByText("tester")).toBeInTheDocument();
    expect(screen.getByText("Создал")).toBeInTheDocument();
    expect(screen.getByText("Создано")).toBeInTheDocument();
    expect(screen.queryByText(/Шаг \d/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Далее" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Сохранить" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Источник образования")).toBeInTheDocument();
    });
  });

  it("locks operation type when the operation is linked", () => {
    renderCard(makeOperation({ linked_operation_id: "op-2" }));

    expect(screen.getByLabelText(/Тип операции/)).toBeDisabled();
    expect(
      screen.getByText("Тип связанной пары передачи изменить нельзя."),
    ).toBeInTheDocument();
  });

  it("hides save for a declined operation", () => {
    renderCard(makeOperation({ status: "declined", balance: null }));

    expect(
      screen.queryByRole("button", { name: "Сохранить" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Удалить" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Отмена" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Тип операции/)).toBeDisabled();
  });

  it("shows review actions when confirmation is required", () => {
    renderCard(
      makeOperation({
        status: "confirmation_required",
        balance: null,
      }),
    );

    expect(
      screen.getByRole("button", { name: "Подтвердить" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Отклонить" }),
    ).toBeInTheDocument();
  });
});
