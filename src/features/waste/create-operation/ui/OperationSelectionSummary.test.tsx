import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OperationSelectionSummary } from "./OperationSelectionSummary";

afterEach(cleanup);

describe("OperationSelectionSummary", () => {
  it("renders selected unit and waste", () => {
    render(
      <OperationSelectionSummary
        unitLabel="Организация -> Цех №1"
        wasteLabel="12345678901 — Отход тестовый"
        wasteMeta="4 класс опасности · кг"
      />,
    );

    expect(screen.getByText("Место учёта")).toBeInTheDocument();
    expect(screen.getByText("Организация -> Цех №1")).toBeInTheDocument();
    expect(screen.getByText("Отход")).toBeInTheDocument();
    expect(screen.getByText("12345678901 — Отход тестовый")).toBeInTheDocument();
    expect(screen.getByText("4 класс опасности · кг")).toBeInTheDocument();
  });

  it("renders nothing when both values are missing", () => {
    const { container } = render(<OperationSelectionSummary />);
    expect(container).toBeEmptyDOMElement();
  });
});
