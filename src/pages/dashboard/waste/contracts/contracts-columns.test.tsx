import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Contract } from "../../../../entities/waste/contracts";
import type { UserProfile } from "../../../../entities/user";
import { DataTable } from "../../../../shared/ui";
import { contractsColumns } from "./contracts-columns";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));

const profile: UserProfile = {
  id: "99999999-9999-4999-8999-999999999999",
  username: "tester",
  email: null,
  first_name: null,
  last_name: null,
  last_seen_at: null,
};

function contract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    tenant_id: "11111111-1111-4111-8111-111111111111",
    number: "Д-001",
    start_date: "2026-01-15",
    end_date: null,
    contract_type: "recycling",
    status: "active",
    counterparty_id: "550e8400-e29b-41d4-a716-446655440000",
    counterparty: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Ромашка",
    },
    counterparty_address: null,
    counterparty_contact: null,
    amount: null,
    with_ownership_transfer: false,
    transfer_purpose: "storage",
    storage_facility_type: null,
    disposal_facility_type: null,
    wastes: [],
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    created_by: profile,
    updated_by: profile,
    ...overrides,
  };
}

function renderPurpose(row: Contract) {
  return render(
    <DataTable
      columns={contractsColumns(
        () => {},
        () => {},
      )}
      data={[row]}
      getRowId={(item) => item.id}
    />,
  );
}

afterEach(cleanup);

describe("contractsColumns transfer purpose", () => {
  it("shows a facility type badge when the contract has one", () => {
    renderPurpose(
      contract({
        storage_facility_type: "sludge",
      }),
    );

    expect(screen.getByText("Хранение")).toBeInTheDocument();
    expect(screen.getByText("Шламохранилище")).toBeInTheDocument();
    expect(screen.queryByText("С передачей права")).not.toBeInTheDocument();
  });

  it("shows a disposal facility badge", () => {
    renderPurpose(
      contract({
        transfer_purpose: "disposal",
        disposal_facility_type: "landfill_msw",
      }),
    );

    expect(screen.getByText("Захоронение")).toBeInTheDocument();
    expect(
      screen.getByText("Полигон твёрдых коммунальных отходов"),
    ).toBeInTheDocument();
  });

  it("keeps the ownership badge and hides facility type when none is set", () => {
    renderPurpose(
      contract({
        transfer_purpose: "use",
        with_ownership_transfer: true,
      }),
    );

    expect(screen.getByText("Использование")).toBeInTheDocument();
    expect(screen.getByText("С передачей права")).toBeInTheDocument();
    expect(screen.queryByText("Шламохранилище")).not.toBeInTheDocument();
  });
});
